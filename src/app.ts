import { HttpApiBuilder, HttpMiddleware, HttpServer } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { CheckHealthApi, CheckHealthApiLive } from "./routers/CheckHealth";
import { Effect, Layer } from "effect";
import { config } from "./services/Config";

const EngineerAPILive = HttpApiBuilder.api(CheckHealthApi).pipe(Layer.provide(CheckHealthApiLive));

const HttpLive = Effect.gen(function* () {
  const { port } = yield* config;
  return HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
    Layer.provide(HttpApiBuilder.middlewareCors()),
    Layer.provide(EngineerAPILive),
    HttpServer.withLogAddress,
    Layer.provide(BunHttpServer.layer({ port })),
  );
});

HttpLive.pipe(Layer.unwrapEffect, Layer.launch, BunRuntime.runMain);
