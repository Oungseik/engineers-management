import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import * as SqliteDrizzle from "@effect/sql-drizzle/Sqlite";
import { SqliteClient } from "@effect/sql-sqlite-bun";
import { Effect, Layer } from "effect";

import { config } from "@/services/Config";

import { HttpLive } from "./app";

// bun implementation of sqlite db live
const SqlLive = config.pipe(
  Effect.map((c) => SqliteClient.layer({ filename: c.dbUrl })),
  Layer.unwrapEffect,
);
const DrizzleLive = SqliteDrizzle.layer.pipe(Layer.provide(SqlLive));
const SqliteDbLive = Layer.mergeAll(SqlLive, DrizzleLive);

const bunServer = Effect.gen(function*() {
  const { port } = yield* config;
  return HttpLive.pipe(Layer.provide(SqliteDbLive), Layer.provide(BunHttpServer.layer({ port })));
});

bunServer.pipe(Layer.unwrapEffect, Layer.launch, BunRuntime.runMain);
