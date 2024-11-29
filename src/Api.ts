import { HttpApi, HttpApiBuilder } from "@effect/platform";
import { Layer } from "effect";

import {
  AuthApiLive,
  AuthGroup,
  CheckHealthApiLive,
  CheckHealthGroup,
  EngineersApiLive,
  EngineersGroup,
} from "./routers";

export const Api = HttpApi.empty.add(CheckHealthGroup).add(AuthGroup).add(EngineersGroup);

export const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(CheckHealthApiLive),
  Layer.provide(AuthApiLive),
  Layer.provide(EngineersApiLive),
);
