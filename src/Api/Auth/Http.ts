import { HttpApi, HttpApiBuilder } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { Effect as Ef, pipe } from "effect";

import { InternalServerError, NotFound } from "@/lib/HttpErrors";
import { handleSqlError } from "@/lib/SqlErrors";
import { engineers } from "@/schemas/sqlite";
import { Hashing } from "@/services/Hashing";
import { Jwt } from "@/services/Jwt";

import { AuthApi } from "./Api";

const Api = HttpApi.empty.add(AuthApi);

export const AuthApiLive = HttpApiBuilder.group(Api, "authentication", (handlers) =>
  Ef.gen(function* () {
    const db = yield* SqliteDrizzle;
    const jwt = yield* Jwt;
    const { hash } = yield* Hashing;

    return handlers
      .handle("register engineer", ({ payload }) =>
        pipe(
          hash(payload.password),
          Ef.tap((password) => db.insert(engineers).values({ ...payload, password })),
          Ef.andThen({ ...payload }),
          Ef.catchTags({
            SqlError: handleSqlError,
            HashingError: () => new InternalServerError({ message: "something went wrong" }),
          }),
        ),
      )
      .handle("log-in engineer", ({ payload }) =>
        pipe(
          db.select().from(engineers).where(eq(engineers.email, payload.email)),
          Ef.tap((res) => (res.length > 0 ? Ef.void : new NotFound({ message: "not found" }))),
          Ef.flatMap(() => jwt.sign({ email: payload.email })),
          Ef.map((token) => ({ token })),
          Ef.catchTags({
            SqlError: handleSqlError,
            JwtError: () => new InternalServerError({ message: "something went wrong" }),
          }),
        ),
      );
  }),
);
