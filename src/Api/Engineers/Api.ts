import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, Multipart, OpenApi } from "@effect/platform";
import { Schema as S } from "effect";

import { InternalServerError, NotFound } from "@/lib/HttpErrors";
import { Authorization } from "@/lib/Middlewares";

const BufferFromSelf = S.declare((input: unknown): input is Buffer => input instanceof Buffer, {
  identifier: "BufferFromSelf",
});

const Engineer = S.Struct({
  name: S.NonEmptyString,
  email: S.NonEmptyString,
  nationality: S.NonEmptyString,
  profilePic: BufferFromSelf.pipe(S.NullOr),
  selfIntro: S.String.pipe(S.NullOr),
});

const getMeEndpoint = HttpApiEndpoint.get("get self info", "/me")
  .addSuccess(Engineer)
  .addError(NotFound)
  .addError(InternalServerError)
  .annotateContext(
    OpenApi.annotations({
      title: "self info",
      description: "API endpoint to get the information of current user",
    }),
  );

const updateMeEndpoint = HttpApiEndpoint.post("update self info", "/me")
  .setPayload(
    S.Struct({
      name: S.NonEmptyString.pipe(S.optional),
      email: S.NonEmptyString.pipe(S.optional),
      nationality: S.NonEmptyString.pipe(S.optional),
      selfIntro: S.NonEmptyString.pipe(S.optional),
    }),
  )
  .addSuccess(S.Struct({ success: S.Boolean }))
  .addError(NotFound)
  .addError(InternalServerError)
  .annotateContext(
    OpenApi.annotations({
      title: "update self info",
      description: "API endpoint to update the information of current user",
    }),
  );

const uploadProfileEndpoint = HttpApiEndpoint.post("upload profile picture", "/me/profile/upload")
  .setPayload(HttpApiSchema.Multipart(S.Struct({ file: Multipart.FileSchema })))
  .addSuccess(S.Struct({ success: S.Literal(true) }))
  .addError(InternalServerError)
  .annotateContext(
    OpenApi.annotations({
      title: "upload profile pic",
      description: "API endpoint to upload or update the profile picture",
    }),
  );

export const EngineersApi = HttpApiGroup.make("engineers")
  .add(getMeEndpoint)
  .add(updateMeEndpoint)
  .add(uploadProfileEndpoint)
  .middleware(Authorization)
  .prefix("/api/engineers")
  .annotateContext(
    OpenApi.annotations({
      title: "Engineers APIs",
      description: "APIs to manage engineers",
    }),
  );
