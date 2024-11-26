import { HttpApiSchema } from "@effect/platform";
import { Schema as S } from "effect";

export class UnprocessableContent extends S.TaggedError<UnprocessableContent>()(
  "UnprocessableContent",
  { message: S.String },
  HttpApiSchema.annotations({ status: 422 }),
) {}

export class InternalServerError extends S.TaggedError<InternalServerError>()(
  "InternalServerError",
  { message: S.String },
  HttpApiSchema.annotations({ status: 500 }),
) {}
