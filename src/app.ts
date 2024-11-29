import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer } from "@effect/platform";
import { BunFileSystem, BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Effect, Layer } from "effect";

import { config } from "@/services/Config";
import { SqliteDbLive } from "@/services/Database";
import { Argon2HashingLive } from "@/services/Hashing";
import { JwtLive } from "@/services/Jwt";

import { ApiLive } from "./Api";
import { AuthorizationLive } from "./lib/Middlewares";

const FsLive = BunFileSystem.layer;

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer({ path: "/docs" })),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provide(AuthorizationLive),
  Layer.provide(SqliteDbLive),
  Layer.provide(Argon2HashingLive),
  Layer.provide(JwtLive),
  Layer.provide(FsLive),
);

// ------------------------------------------------------------
// Setup bun server and run (you can replace with node runtime)
// ------------------------------------------------------------
const bunServer = Effect.gen(function* () {
  const { port } = yield* config;
  return HttpLive.pipe(Layer.provide(BunHttpServer.layer({ port })));
});

bunServer.pipe(Layer.unwrapEffect, Layer.launch, BunRuntime.runMain);
