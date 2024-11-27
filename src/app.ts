import {
  HttpApi,
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
} from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Effect, Layer } from "effect";

import { config } from "@/services/Config";
import { SqliteDbLive } from "@/services/Database";
import { Argon2HashingLive } from "@/services/Hashing";

import { CheckHealthApiLive, CheckHealthGroup, EngineerApiLive, EngineersGroup } from "./routers";

const api = HttpApi.empty.add(CheckHealthGroup).add(EngineersGroup);

const Main = HttpApiBuilder.api(api).pipe(
  Layer.provide(CheckHealthApiLive),
  Layer.provide(EngineerApiLive),
);

const HttpLive = Effect.gen(function* () {
  const { port } = yield* config;
  return HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
    Layer.provide(HttpApiSwagger.layer({ path: "/docs" })),
    Layer.provide(HttpApiBuilder.middlewareCors()),
    Layer.provide(Main),
    HttpServer.withLogAddress,
    Layer.provide(SqliteDbLive),
    Layer.provide(Argon2HashingLive),
    Layer.provide(JwtLive),
    Layer.provide(BunHttpServer.layer({ port })),
  );
});

HttpLive.pipe(Layer.unwrapEffect, Layer.launch, BunRuntime.runMain);
