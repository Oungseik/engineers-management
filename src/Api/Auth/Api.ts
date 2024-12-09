import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { Schema as S } from "effect";

import { Email, Password } from "@/Domain";
import { InternalServerError, NotFound, UnprocessableContent } from "@/lib/HttpErrors";
import { UserAuthorization } from "@/Middlewares";

const registerEngineerEndpoint = HttpApiEndpoint.post("register engineer", "/engineers/register")
  .setPayload(
    S.Struct({
      name: S.NonEmptyString,
      email: Email,
      password: Password,
      nationality: S.String,
    }),
  )
  .addSuccess(S.Struct({ email: Email, name: S.NonEmptyString }))
  .addError(UnprocessableContent)
  .addError(InternalServerError)
  .annotateContext(
    OpenApi.annotations({
      title: "Register Engineer",
      description: "API endpoint to create an account as an engineer",
    }),
  );

const loginEngineerEndpoint = HttpApiEndpoint.post("log-in engineer", "/engineers/login")
  .setPayload(S.Struct({ email: Email, password: Password }))
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

const registerEmployerEndpoint = HttpApiEndpoint.post("register as employer", "/employers/register")
  .setPayload(
    S.Struct({
      name: S.NonEmptyString,
      email: Email,
      password: Password,
      org: S.NonEmptyString,
      position: S.NonEmptyString,
    }),
  )
  .addSuccess(S.Struct({ name: S.NonEmptyString, email: Email }))
  .addError(UnprocessableContent)
  .addError(InternalServerError)
  .annotateContext(
    OpenApi.annotations({
      title: "Register employer",
      description: "API endpoint to create account as an employer",
    }),
  );

const loginEmployerEndpoint = HttpApiEndpoint.post("login as employer", "/employers/login")
  .setPayload(S.Struct({ email: Email, password: Password }))
  .addSuccess(S.Struct({ token: S.String }))
  .addError(NotFound)
  .addError(UnprocessableContent)
  .addError(InternalServerError)
  .annotateContext(
    OpenApi.annotations({
      title: "Log-in Employer",
      description: "API endpoint to login as an employer.",
    }),
  );

const deleteAccount = HttpApiEndpoint.del("delete account", "/")
  .setPayload(S.Struct({ password: S.String }))
  .addSuccess(S.Struct({ status: S.Literal(true) }))
  .addError(NotFound)
  .addError(UnprocessableContent)
  .addError(InternalServerError)
  .middleware(UserAuthorization)
  .annotateContext(
    OpenApi.annotations({
      title: "Delete account",
      description: "API endpoint to delete account of all types.",
    }),
  );

export const AuthApi = HttpApiGroup.make("authentication")
  .add(registerEngineerEndpoint)
  .add(loginEngineerEndpoint)
  .add(registerEmployerEndpoint)
  .add(loginEmployerEndpoint)
  .add(deleteAccount)
  .prefix("/api/auth")
  .annotateContext(
    OpenApi.annotations({
      title: "Authentication APIs",
      description: "APIs to do authentication stuffs like register, sign-in and sign-out.",
    }),
  );
