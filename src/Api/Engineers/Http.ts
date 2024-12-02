import { FileSystem, HttpApi, HttpApiBuilder } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { Effect as Ef, pipe } from "effect";

import { InternalServerError, NotFound, UnprocessableContent } from "@/lib/HttpErrors";
import { CurrentUser } from "@/Middlewares";
import { engineers, experiences, skills } from "@/schemas/sqlite";
import { isRecord } from "@/lib/SqlErrors";

import { EngineersApi } from "./Api";

const Api = HttpApi.empty.add(EngineersApi);

export const EngineersApiLive = HttpApiBuilder.group(Api, "engineers", (handlers) =>
  Ef.gen(function* () {
    const db = yield* SqliteDrizzle;
    const fs = yield* FileSystem.FileSystem;

    return handlers
      .handle("get self info", () =>
        pipe(
          CurrentUser,
          Ef.flatMap((user) => db.select().from(engineers).where(eq(engineers.email, user.email))),
          Ef.map((engineers) => engineers.at(0)),
          Ef.flatMap(Ef.fromNullable),
          Ef.map((engineer) => ({
            ...engineer,
            profilePic: "data:image/png;base64," + (engineer.profilePic?.toString("base64") ?? ""),
          })),
          Ef.catchTags({
            NoSuchElementException: () => new NotFound({ message: "user doesn't exist" }),
            SqlError: () => new InternalServerError({ message: "unexpected error occured" }),
          }),
        ),
      )
      .handle("update self info", ({ payload }) =>
        CurrentUser.pipe(
          Ef.flatMap((user) =>
            db
              .update(engineers)
              .set({ ...payload })
              .where(eq(engineers.email, user.email)),
          ),
          Ef.andThen({ success: true }),
          Ef.mapError(() => new InternalServerError({ message: "something went wrong " })),
        ),
      )
      .handle("upload profile picture", ({ payload: { files } }) =>
        CurrentUser.pipe(
          Ef.bindTo("user"),
          Ef.bind("uinit8Array", () => fs.readFile(files[0].path)),
          Ef.tap(({ user, uinit8Array }) =>
            db
              .update(engineers)
              .set({ profilePic: Buffer.from(uinit8Array) })
              .where(eq(engineers.email, user.email)),
          ),
          Ef.andThen({ success: true } as const),
          Ef.catchAll((e) => new InternalServerError({ message: e.message })),
        ),
      )
      .handle("get list of added skills", () =>
        Ef.gen(function* () {
          const user = yield* CurrentUser;
          const result = yield* db
            .select()
            .from(experiences)
            .leftJoin(skills, eq(skills.id, experiences.skillId))
            .where(eq(experiences.engineerId, user.id))
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
        Ef.gen(function* () {
          const user = yield* CurrentUser;
          yield* db
            .insert(experiences)
            .values({ ...payload, engineerId: user.id })
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
