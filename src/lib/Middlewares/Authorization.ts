import { HttpApiMiddleware, HttpApiSecurity } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { Context, Effect, Layer, Redacted,Schema as S } from "effect";

import { engineers } from "@/schemas/sqlite";
import { Jwt } from "@/services/Jwt";

import { Unauthorized } from "../HttpErrors";

class User extends S.Class<User>("User")({
  id: S.Number,
  email: S.NonEmptyString,
  name: S.NonEmptyString,
}) {}
export class CurrentUser extends Context.Tag("CurrentUser")<CurrentUser, User>() {}

export class Authorization extends HttpApiMiddleware.Tag<Authorization>()("Authorization", {
  failure: Unauthorized,
  provides: CurrentUser,
  security: { token: HttpApiSecurity.bearer },
}) {}

export const AuthorizationLive = Layer.effect(
  Authorization,
  Effect.gen(function* () {
    yield* Effect.log("creating Authorization middleware");
    const { verify } = yield* Jwt;
    const db = yield* SqliteDrizzle;

    // return the security handlers
    return Authorization.of({
      token: (bearerToken) =>
        Effect.gen(function* () {
          yield* Effect.log("checking bearer token", Redacted.value(bearerToken));
          const token = Redacted.value(bearerToken);
          const result = yield* verify(token).pipe(
            Effect.mapError(() => new Unauthorized({ message: "invalid token" })),
          );

          const email: string = yield* Effect.fromNullable(result.email).pipe(
            Effect.mapError(() => new Unauthorized({ message: "invalid token" })),
          );

          const users = yield* db
            .select()
            .from(engineers)
            .where(eq(engineers.email, email))
            .pipe(Effect.mapError(() => new Unauthorized({ message: "invalid token" })));

          const user = yield* Effect.fromNullable(users.at(0)).pipe(
            Effect.mapError(() => new Unauthorized({ message: "invalid token" })),
          );

          return new User({ ...user });
        }),
    });
  }),
);
