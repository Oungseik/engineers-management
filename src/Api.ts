import { HttpApi, HttpApiBuilder } from "@effect/platform";
import { Layer } from "effect";

import { AuthApi, AuthApiLive } from "./Api/Auth";
import { CheckHealthApi, CheckHealthApiLive } from "./Api/CheckHealth";
import { EngineersApi, EngineersApiLive } from "./Api/Engineers";

export const Api = HttpApi.empty.add(CheckHealthApi).add(AuthApi).add(EngineersApi);

export const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(CheckHealthApiLive),
  Layer.provide(AuthApiLive),
  Layer.provide(EngineersApiLive),
);
