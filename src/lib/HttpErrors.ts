import { HttpApiSchema } from "@effect/platform";
import { Schema as S } from "effect";

export class BadRequest extends S.TaggedError<BadRequest>()(
  "BadRequest",
  { message: S.String },
  HttpApiSchema.annotations({ status: 400 }),
) {}
