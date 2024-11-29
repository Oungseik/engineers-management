import { HttpApi, HttpApiBuilder } from "@effect/platform";
import type { SqlError } from "@effect/sql";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { Effect as Ef, pipe } from "effect";

import { InternalServerError, NotFound, UnprocessableContent } from "@/lib/HttpErrors";
import { engineers } from "@/schemas/sqlite";
import { Hashing } from "@/services/Hashing";
import { Jwt } from "@/services/Jwt";

import { AuthApi } from "./Api";

const Api = HttpApi.empty.add(AuthApi);

function isRecord(value: unknown): value is Record<string, string> {
  return typeof value === "object";
}

function handleSqlError(e: SqlError.SqlError) {
  return isRecord(e.cause) && e.cause.code === "SQLITE_CONSTRAINT_UNIQUE"
    ? new UnprocessableContent({ message: "email already used" })
    : new InternalServerError({ message: "something went wrong" });
}

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
