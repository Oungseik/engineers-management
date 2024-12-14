import { FileSystem, HttpApi, HttpApiBuilder } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { Effect as Ef, pipe, Schema as S } from "effect";

import { InternalServerError, NotFound, UnprocessableContent } from "@/lib/HttpErrors";
import { isRecord } from "@/lib/SqlErrors";
import { CurrentEngineer } from "@/Middlewares";
import { engineers, experiences, skills, users } from "@/schemas/sqlite";

import { EngineersApi, SelfInfo } from "./Api";

const Api = HttpApi.empty.add(EngineersApi);

export const EngineersApiLive = HttpApiBuilder.group(Api, "engineers", (handlers) =>
  Ef.gen(function*() {
    const db = yield* SqliteDrizzle;
    const fs = yield* FileSystem.FileSystem;

    return handlers
      .handle("get self info", () =>
        pipe(
          CurrentEngineer,
          Ef.flatMap((u) =>
            db
              .select()
              .from(engineers)
              .leftJoin(users, eq(users.email, engineers.userEmail))
              .where(eq(engineers.userEmail, u.email)),
          ),
          Ef.map((engineers) => engineers.at(0)),
          Ef.flatMap(Ef.fromNullable),
          Ef.flatMap(({ engineers, users }) =>
            S.decodeUnknown(SelfInfo)(Object.assign(engineers, users)),
          ),
          Ef.catchTags({
            ParseError: () => new InternalServerError({ message: "incompleted data" }),
            NoSuchElementException: () => new NotFound({ message: "user doesn't exist" }),
            SqlError: () => new InternalServerError({ message: "unexpected error occured" }),
          }),
        ),
      )
      .handle("update self info", ({ payload }) =>
        CurrentEngineer.pipe(
          Ef.flatMap((user) =>
            db
              .update(engineers)
              .set({ ...payload })
              .where(eq(engineers.userEmail, user.email)),
          ),
          Ef.andThen({ success: true }),
          Ef.mapError(() => new InternalServerError({ message: "something went wrong " })),
        ),
      )
      .handle("upload profile picture", ({ payload: { files } }) =>
        CurrentEngineer.pipe(
          Ef.bindTo("user"),
          Ef.bind("uinit8Array", () => fs.readFile(files[0].path)),
          Ef.tap(({ user, uinit8Array }) =>
            db
              .update(users)
              .set({ profilePic: Buffer.from(uinit8Array) })
              .where(eq(users.email, user.email)),
          ),
          Ef.andThen({ success: true } as const),
          Ef.catchAll((e) => new InternalServerError({ message: e.message })),
        ),
      )
      .handle("get list of added skills", () =>
        Ef.gen(function*() {
          const user = yield* CurrentEngineer;
          const result = yield* db
            .select()
            .from(experiences)
            .leftJoin(skills, eq(skills.name, experiences.skillName))
            .where(eq(experiences.engineerEmail, user.email))
            .limit(1)
            .pipe(Ef.mapError(() => new InternalServerError({ message: "something went wrong" })));

          return result.map((r) => ({
            name: r.skills?.name ?? "",
            tag: r.skills?.tag ?? "",
            yearsOfExp: r.experiences?.yearsOfExp ?? 0,
          }));
        }),
      )
      .handle("add new skill in self skill list", ({ payload }) =>
        Ef.gen(function*() {
          const user = yield* CurrentEngineer;
          yield* db
            .insert(experiences)
            .values({ ...payload, engineerEmail: user.email })
            .pipe(
              Ef.mapError((e) =>
                isRecord(e.cause) && e.cause.code === "SQLITE_CONSTRAINT_PRIMARYKEY"
                  ? new UnprocessableContent({ message: "skill duplicated" })
                  : new InternalServerError({ message: "something went wrong" }),
              ),
            );

          return { success: true } as const;
        }),
      );
  }),
);
