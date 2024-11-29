import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { Schema as S } from "effect";

import { InternalServerError, NotFound, UnprocessableContent } from "@/lib/HttpErrors";

const EmailSchema = S.NonEmptyString;

const registerEngineerEndpoint = HttpApiEndpoint.post("register engineer", "/engineers/register")
  .setPayload(
    S.Struct({
      name: S.NonEmptyString,
      email: EmailSchema,
      password: S.NonEmptyString,
      nationality: S.String,
    }),
  )
  .addSuccess(S.Struct({ email: EmailSchema, name: S.NonEmptyString }))
  .addError(UnprocessableContent)
  .addError(InternalServerError)
  .annotateContext(
    OpenApi.annotations({
      title: "Register Engineer",
      description: "API endpoint to register a new engineer",
    }),
  );

const loginEngineerEndpoint = HttpApiEndpoint.post("log-in engineer", "/engineers/login")
  .setPayload(S.Struct({ email: EmailSchema, password: S.NonEmptyString }))
  .addSuccess(S.Struct({ token: S.String }))
  .addError(NotFound)
  .addError(UnprocessableContent)
  .addError(InternalServerError)
  .annotateContext(
    OpenApi.annotations({
      title: "Log-in Engineer",
      description: "API endpoint to log-in as an engineer.",
    }),
  );

export const AuthApi = HttpApiGroup.make("authentication")
  .add(registerEngineerEndpoint)
  .add(loginEngineerEndpoint)
  .prefix("/api/auth")
  .annotateContext(
    OpenApi.annotations({
      title: "Authentication APIs",
      description: "APIs to do authentication stuffs like register, sign-in and sign-out.",
    }),
  );
