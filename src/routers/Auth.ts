import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { Effect, Schema as S } from "effect";

import { InternalServerError, UnprocessableContent } from "@/lib/HttpErrors";
import { engineers } from "@/schemas/sqlite";
import { Hashing } from "@/services/Hashing";

const EmailSchema = S.NonEmptyString;

export const EngineersGroup = HttpApiGroup.make("authentication")
  .add(
    HttpApiEndpoint.post("register engineer", "/api/auth/register/engineer")
      .setPayload(
        S.Struct({
          name: S.NonEmptyString,
          email: EmailSchema,
          password: S.NonEmptyString,
          nationality: S.String,
        }),
      )
      .addSuccess(S.Struct({ email: EmailSchema, name: S.NonEmptyString }))
      .addError(UnprocessableContent)
      .addError(InternalServerError)
      .annotateContext(
        OpenApi.annotations({
          title: "Register Engineer",
          description: "API end point to register a new engineer",
        }),
      ),
  )
  .annotateContext(
    OpenApi.annotations({
      title: "Authentication APIs",
      description: "APIs to do authentication stuffs like register, sign-in and sign-out.",
    }),
  );

const EngineerApi = HttpApi.empty.add(EngineersGroup);

// --------------------------------------------
// Implementation
// --------------------------------------------
export const EngineerApiLive = HttpApiBuilder.group(EngineerApi, "authentication", (handlers) =>
  handlers.handle("register engineer", ({ payload }) =>
    Effect.gen(function* () {
      const db = yield* SqliteDrizzle;
      const { hash } = yield* Hashing;

      const password = yield* hash(payload.password).pipe(
        Effect.catchAll(() => new InternalServerError({ message: "something went wrong" })),
      );

      yield* db
        .insert(engineers)
        .values({ ...payload, password })
        .pipe(
          Effect.catchIf(
            (e) => (e.cause as Record<string, string>).code === "SQLITE_CONSTRAINT_UNIQUE",
            () =>
              new UnprocessableContent({ message: "Already created account with provided email" }),
          ),
          Effect.catchTag(
            "SqlError",
            () => new InternalServerError({ message: "something went wrong" }),
          ),
        );
      return { ...payload };
    }),
  ),
);
