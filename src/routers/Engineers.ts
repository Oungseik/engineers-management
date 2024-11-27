import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { Effect as Ef, Schema as S } from "effect";

import { InternalServerError, NotFound } from "@/lib/HttpErrors";
import { Authorization, CurrentUser } from "@/lib/Middlewares";
import { engineers } from "@/schemas/sqlite";

const meEndpint = HttpApiEndpoint.get("get self info", "/api/engineers/me")
  .addSuccess(
    S.Struct({
      name: S.NonEmptyString,
      email: S.NonEmptyString,
      nationality: S.NonEmptyString,
      profilePic: S.String.pipe(S.NullOr),
      selfIntro: S.String.pipe(S.NullOr),
    }),
  )
  .addError(NotFound)
  .addError(InternalServerError)
  .middleware(Authorization)
  .annotateContext(
    OpenApi.annotations({
      title: "self profile",
      description: "API endpoint to get the information of current user",
    }),
  );

export const EngineersGroup = HttpApiGroup.make("engineers")
  .add(meEndpint)
  .annotateContext(
    OpenApi.annotations({
      title: "Engineers APIs",
      description: "APIs to manage engineers",
    }),
  );

const EngineersApi = HttpApi.empty.add(EngineersGroup);

// --------------------------------------------
// Implementation
// --------------------------------------------
export const EngineersApiLive = HttpApiBuilder.group(EngineersApi, "engineers", (handlers) =>
  handlers.handle("get self info", () =>
    Ef.gen(function* () {
      const user = yield* CurrentUser;
      const db = yield* SqliteDrizzle;

      const users = yield* db
        .select()
        .from(engineers)
        .where(eq(engineers.email, user.email))
        .pipe(Ef.mapError(() => new InternalServerError({ message: "unexpected error occured" })));

      const engineer = yield* Ef.fromNullable(users.at(0)).pipe(
        Ef.mapError(() => new NotFound({ message: "user doesn't exist" })),
      );
      return { ...engineer };
    }),
  ),
);
