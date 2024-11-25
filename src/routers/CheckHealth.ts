import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { Effect, Layer, Schema } from "effect";

const CheckHealth = Schema.Struct({
  message: Schema.String,
});

const group = HttpApiGroup.make("check-health")
  .add(HttpApiEndpoint.get("check-health", "/check-health").addSuccess(CheckHealth))
  .annotateContext(
    OpenApi.annotations({
      title: "Check Health API",
      description: "Api for check health of the server",
    }),
  );

export const CheckHealthApi = HttpApi.empty.add(group);

// --------------------------------------------
// Implementation
// --------------------------------------------
export const CheckHealthApiLive: Layer.Layer<HttpApiGroup.ApiGroup<"check-health">> =
  HttpApiBuilder.group(CheckHealthApi, "check-health", (handlers) =>
    handlers.handle("check-health", () => Effect.succeed({ message: "Server is up and running" })),
  );
