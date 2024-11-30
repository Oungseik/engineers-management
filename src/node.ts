import { createServer } from "node:http";

import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import * as SqliteDrizzle from "@effect/sql-drizzle/Sqlite";
import { SqliteClient } from "@effect/sql-sqlite-node";
import { Effect } from "effect";
import { Layer } from "effect";

import { config } from "@/services/Config";

import { HttpLive } from "./app.ts";

// node js implementation of sqlite db live
const SqlLive = config.pipe(
  Effect.map((c) => SqliteClient.layer({ filename: c.dbUrl })),
  Layer.unwrapEffect,
);
const DrizzleLive = SqliteDrizzle.layer.pipe(Layer.provide(SqlLive));
const SqliteDbLive = Layer.mergeAll(SqlLive, DrizzleLive);

HttpLive.pipe(
  Layer.provide(SqliteDbLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 5000 })),
  Layer.launch,
  NodeRuntime.runMain,
);
