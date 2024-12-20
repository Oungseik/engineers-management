import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { Schema as S } from "effect";

import { SKILL_TAGS } from "@/Domain";
import { InternalServerError, UnprocessableContent } from "@/lib/HttpErrors";
import { AdminAuthorization } from "@/Middlewares";

const Skill = S.Struct({
  name: S.NonEmptyString,
  tag: S.Literal(...SKILL_TAGS),
});

const getSkills = HttpApiEndpoint.get("get list of skills", "/")
  .addSuccess(S.Array(Skill))
  .addError(InternalServerError)
  .annotateContext(
    OpenApi.annotations({
      title: "Get skills",
      description: "API endpoint to get list of skills which can select",
    }),
  );

const postSkill = HttpApiEndpoint.post("add new skill in a skill list", "/")
  .setPayload(S.Struct({ name: S.NonEmptyString, tag: S.Literal(...SKILL_TAGS) }))
  .addSuccess(S.Struct({ success: S.Literal(true) }))
  .addError(UnprocessableContent)
  .addError(InternalServerError)
  .middleware(AdminAuthorization)
  .annotateContext(
    OpenApi.annotations({
      title: "Add Skill",
      description: "API endpoint to add new skill in the skills list",
    }),
  );

export const SkillsApi = HttpApiGroup.make("skills")
  .add(getSkills)
  .add(postSkill)
  .prefix("/api/skills")
  .annotateContext(
    OpenApi.annotations({ title: "Skills APIS", description: "APIs to manage possible skills" }),
  );
