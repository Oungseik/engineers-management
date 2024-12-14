import { describe, it, expect } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { Api, CheckHealthApiLive } from "@/Api/CheckHealth";
import { HttpApiClient, HttpApiBuilder, FetchHttpClient } from "@effect/platform";

export const ApiLive = HttpApiBuilder.api(Api).pipe(Layer.provide(CheckHealthApiLive));

describe("CheckHealth", () => {
  it.effect("checkHealth", () =>
    Effect.gen(function*() {
      const client = yield* HttpApiClient.make(Api, { baseUrl: "http://localhost:5000" });
      const result = yield* client["check-health"].checkHealth();
      expect(result.message).toBe("server is up and running");
    }).pipe(Effect.scoped, Effect.provide(FetchHttpClient.layer)),
  );
});
