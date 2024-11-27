import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { Effect as Ef, Schema as S } from "effect";

import { InternalServerError, NotFound, UnprocessableContent } from "@/lib/HttpErrors";
import { engineers } from "@/schemas/sqlite";
import { Hashing } from "@/services/Hashing";
import { Jwt } from "@/services/Jwt";

const EmailSchema = S.NonEmptyString;

const registerEngineerEndpoint = HttpApiEndpoint.post(
  "register engineer",
  "/api/auth/engineers/register",
)
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
      description: "API endpoint to register a new engineer",
    }),
  );

const loginEngineerEndpoint = HttpApiEndpoint.post("log-in engineer", "/api/auth/engineers/login")
  .setPayload(S.Struct({ email: EmailSchema, password: S.NonEmptyString }))
  .addSuccess(S.Struct({ token: S.String }))
  .addError(NotFound)
  .addError(UnprocessableContent)
  .addError(InternalServerError)
  .annotateContext(
    OpenApi.annotations({
      title: "Log-in Engineer",
      description: "API endpoint to log-in as an engineer.",
    }),
  );

export const AuthGroup = HttpApiGroup.make("authentication")
  .add(registerEngineerEndpoint)
  .add(loginEngineerEndpoint)
  .annotateContext(
    OpenApi.annotations({
      title: "Authentication APIs",
      description: "APIs to do authentication stuffs like register, sign-in and sign-out.",
    }),
  );

const AuthApi = HttpApi.empty.add(AuthGroup);

// --------------------------------------------
// Implementation
// --------------------------------------------
export const AuthApiLive = HttpApiBuilder.group(AuthApi, "authentication", (handlers) =>
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
