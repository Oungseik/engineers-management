import { HttpApiSchema } from "@effect/platform";
import { Schema as S } from "effect";

export class Unauthorized extends S.TaggedError<Unauthorized>()(
  "Unauthorized",
  { message: S.String },
  HttpApiSchema.annotations({ status: 401 }),
) {}

export class NotFound extends S.TaggedError<NotFound>()(
  "NotFound",
  { message: S.String },
  HttpApiSchema.annotations({ status: 404 }),
) {}

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
