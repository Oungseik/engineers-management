import { HttpApi, HttpApiBuilder } from "@effect/platform";
import { Effect as Ef } from "effect";

import { SkillsApi } from "./Api";

const Api = HttpApi.empty.add(SkillsApi);

export const SkillsApiLive = HttpApiBuilder.group(Api, "skills", (handlers) =>
  Ef.gen(function* () {
    return handlers.handle("get list of skills", () =>
      Ef.succeed([{ name: "TypeScript", tag: "programming language" }]),
    );
  }),
);
