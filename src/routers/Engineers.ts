import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { Effect, Layer, Schema as S } from "effect";

const Email = S.String.pipe(S.filter((s) => s.includes("@") || "invalid email address"));

export const EngineersGroup = HttpApiGroup.make("engineers").add(
  HttpApiEndpoint.post("register engineers", "/engineers/register")
    .setPayload(
      S.Struct({ name: S.String, email: Email, password: S.String, nationality: S.String }),
    )
    .addSuccess(S.Struct({ email: Email }))
    .annotateContext(
      OpenApi.annotations({
        title: "Register Engineer",
        description: "API end point to register new engineer",
      }),
    ),
);

const EngineerApi = HttpApi.empty.add(EngineersGroup);

// --------------------------------------------
// Implementation
// --------------------------------------------
export const EngineerApiLive: Layer.Layer<HttpApiGroup.ApiGroup<"engineers">> =
  HttpApiBuilder.group(EngineerApi, "engineers", (handlers) =>
    handlers.handle("register engineers", ({ payload }) =>
      Effect.succeed({ email: payload.email }),
    ),
  );
