import { HttpApi, HttpApiBuilder, HttpApiGroup } from "@effect/platform";
import { Effect, Layer } from "effect";

import { CheckHealthApi } from "./Api";

const Api = HttpApi.empty.add(CheckHealthApi);

export const CheckHealthApiLive: Layer.Layer<HttpApiGroup.ApiGroup<"check-health">> =
  HttpApiBuilder.group(Api, "check-health", (handlers) =>
    handlers.handle("check-health", () => Effect.succeed({ message: "server is up and running" })),
  );
