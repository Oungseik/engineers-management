import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer } from "@effect/platform";
import { Layer } from "effect";

import { Argon2HashingLive } from "@/services/Hashing";
import { JwtLive } from "@/services/Jwt";

import { ApiLive } from "./Api";
import { AuthorizationLive } from "./lib/Middlewares";

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer({ path: "/docs" })),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provide(AuthorizationLive),
  Layer.provide(Argon2HashingLive),
  Layer.provide(JwtLive),
);
