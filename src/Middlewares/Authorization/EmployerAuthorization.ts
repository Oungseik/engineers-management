import { HttpApiMiddleware, HttpApiSecurity } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { Context as C, Effect as Ef, Layer as L, Redacted, Schema as S } from "effect";

import { InternalServerError, Unauthorized } from "@/lib/HttpErrors";
import { users } from "@/schemas/sqlite";
import { Jwt } from "@/services/Jwt";

import { User } from ".";

export class CurrentEmployer extends C.Tag("CurrentEmployer")<CurrentEmployer, User>() {}

export class EmployerAuthorization extends HttpApiMiddleware.Tag<EmployerAuthorization>()(
  "EmployerAuthorization",
  {
    failure: S.Union(Unauthorized, InternalServerError),
    provides: CurrentEmployer,
    security: { token: HttpApiSecurity.bearer },
  },
) {}

export const EmployerAuthorizationLive = L.effect(
  EmployerAuthorization,
  Ef.gen(function* () {
    yield* Ef.log("creating employer Authorization middleware");
    const { verify } = yield* Jwt;
    const db = yield* SqliteDrizzle;

    return EmployerAuthorization.of({
      token: (bearerToken) =>
        Ef.gen(function* () {
          const token = Redacted.value(bearerToken);
          const payload = yield* verify(token).pipe(
            Ef.mapError(() => new Unauthorized({ message: "invalid token" })),
          );

          const email: string = yield* Ef.fromNullable(payload.email).pipe(
            Ef.mapError(() => new Unauthorized({ message: "invalid token" })),
          );

          const result = yield* db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .pipe(Ef.mapError(() => new InternalServerError({ message: "something went wrong" })));

          const user = yield* Ef.fromNullable(result.at(0)).pipe(
            Ef.mapError(() => new Unauthorized({ message: "invalid token" })),
          );

          yield* Ef.if(user.role !== "EMPLOYER", {
            onFalse: () => new Unauthorized({ message: "User is not an 'Employer'" }),
            onTrue: () => Ef.void,
          });

          return new User({ email: user.email });
        }),
    });
  }),
);