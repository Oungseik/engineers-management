import { HttpApi, HttpApiBuilder } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { Effect as Ef, pipe } from "effect";

import { InternalServerError, NotFound } from "@/lib/HttpErrors";
import { CurrentUser } from "@/lib/Middlewares";
import { engineers } from "@/schemas/sqlite";

import { EngineersApi } from "./Api";

const Api = HttpApi.empty.add(EngineersApi);

export const EngineersApiLive = HttpApiBuilder.group(Api, "engineers", (handlers) =>
  Ef.gen(function* () {
    const db = yield* SqliteDrizzle;

    return handlers
      .handle("get self info", () =>
        pipe(
          CurrentUser,
          Ef.flatMap((user) => db.select().from(engineers).where(eq(engineers.email, user.email))),
          Ef.map((engineers) => engineers.at(0)),
          Ef.flatMap(Ef.fromNullable),
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
      .handle("upload profile picture", () => Ef.succeed({ success: true }));
  }),
);