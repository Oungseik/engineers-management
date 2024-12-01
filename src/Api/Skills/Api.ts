import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { Schema as S } from "effect";

import { InternalServerError } from "@/lib/HttpErrors";
import { skillTags } from "@/schemas/sqlite";

const Skill = S.Struct({
  name: S.NonEmptyString,
  tag: S.Literal(...skillTags),
});

const getSkills = HttpApiEndpoint.get("get list of skills", "/")
  .addSuccess(S.Array(Skill))
  .addError(InternalServerError)
  .annotateContext(
    OpenApi.annotations({
      title: "Skills",
      description: "API endpoint to get list of skills which can select",
    }),
  );

export const SkillsApi = HttpApiGroup.make("skills")
  .add(getSkills)
  .prefix("/api/skills")
  .annotateContext(
    OpenApi.annotations({ title: "Skills APIS", description: "APIs to manage possible skills" }),
  );
