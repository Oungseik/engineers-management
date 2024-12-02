import { HttpApiMiddleware, HttpApiSecurity } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { Context as C, Effect as Ef, Layer as L, Redacted, Schema as S } from "effect";

import { InternalServerError, Unauthorized } from "@/lib/HttpErrors";
import { engineers } from "@/schemas/sqlite";
import { Jwt } from "@/services/Jwt";

class User extends S.Class<User>("User")({
  id: S.Number,
  email: S.NonEmptyString,
}) {}

export class CurrentUser extends C.Tag("CurrentUser")<CurrentUser, User>() {}

export class Authorization extends HttpApiMiddleware.Tag<Authorization>()("Authorization", {
  failure: S.Union(Unauthorized, InternalServerError),
  provides: CurrentUser,
  security: { token: HttpApiSecurity.bearer },
}) {}

export const AuthorizationLive = L.effect(
  Authorization,
  Ef.gen(function* () {
    yield* Ef.log("creating Authorization middleware");
    const { verify } = yield* Jwt;
    const db = yield* SqliteDrizzle;

    // return the security handlers
    return Authorization.of({
      token: (bearerToken) =>
        Ef.gen(function* () {
          yield* Ef.log("checking bearer token", Redacted.value(bearerToken));
          const token = Redacted.value(bearerToken);
          const result = yield* verify(token).pipe(
            Ef.mapError(() => new Unauthorized({ message: "invalid token" })),
          );

          const email: string = yield* Ef.fromNullable(result.email).pipe(
            Ef.mapError(() => new Unauthorized({ message: "invalid token" })),
          );

          const users = yield* db
            .select()
            .from(engineers)
            .where(eq(engineers.email, email))
            .pipe(Ef.mapError(() => new InternalServerError({ message: "something went wrong" })));

          const user = yield* Ef.fromNullable(users.at(0)).pipe(
            Ef.mapError(() => new Unauthorized({ message: "invalid token" })),
          );

          return new User({ email: user.email, id: user.id });
        }),
    });
  }),
);
