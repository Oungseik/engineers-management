import { HttpApi, HttpApiBuilder } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { Effect as Ef } from "effect";

import { InternalServerError, NotFound, UnprocessableContent } from "@/lib/HttpErrors";
import { engineers } from "@/schemas/sqlite";
import { Hashing } from "@/services/Hashing";
import { Jwt } from "@/services/Jwt";

import { AuthApi } from "./Api";

const Api = HttpApi.empty.add(AuthApi);

export const AuthApiLive = HttpApiBuilder.group(Api, "authentication", (handlers) =>
  handlers
    .handle("register engineer", ({ payload }) =>
      Ef.gen(function* () {
        const db = yield* SqliteDrizzle;
        const { hash } = yield* Hashing;

        const password = yield* hash(payload.password).pipe(
          Ef.mapError(() => new InternalServerError({ message: "something went wrong" })),
        );

        yield* db
          .insert(engineers)
          .values({ ...payload, password })
          .pipe(
            Ef.catchIf(
              (e) => (e.cause as Record<string, string>).code === "SQLITE_CONSTRAINT_UNIQUE",
              () =>
                new UnprocessableContent({
                  message: "Already created account with provided email",
                }),
            ),
            Ef.catchTag(
              "SqlError",
              () => new InternalServerError({ message: "something went wrong" }),
            ),
          );
        return { ...payload };
      }),
    )
    .handle("log-in engineer", ({ payload }) =>
      Ef.gen(function* () {
        const db = yield* SqliteDrizzle;
        const jwt = yield* Jwt;

        const results = yield* db
          .select()
          .from(engineers)
          .where(eq(engineers.email, payload.email))
          .pipe(Ef.mapError(() => new InternalServerError({ message: "something went wrong" })));

        if (results.length === 0) {
          yield* new NotFound({ message: "engineer does not exist" });
        }

        const token = yield* jwt
          .sign({ email: payload.email })
          .pipe(Ef.mapError(() => new InternalServerError({ message: "something went wrong " })));

        return { token };
      }),
    ),
);
