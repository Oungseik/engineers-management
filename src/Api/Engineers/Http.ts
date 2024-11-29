import { HttpApi, HttpApiBuilder, HttpApiSchema, Multipart } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { Brand, Effect as Ef } from "effect";

import { InternalServerError, NotFound } from "@/lib/HttpErrors";
import { CurrentUser } from "@/lib/Middlewares";
import { engineers } from "@/schemas/sqlite";

import { EngineersApi } from "./Api";

const Api = HttpApi.empty.add(EngineersApi);

const getSelfInfoHandler = () =>
  Ef.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* SqliteDrizzle;

    const users = yield* db
      .select()
      .from(engineers)
      .where(eq(engineers.email, user.email))
      .pipe(Ef.mapError(() => new InternalServerError({ message: "unexpected error occured" })));

    const engineer = yield* Ef.fromNullable(users.at(0)).pipe(
      Ef.mapError(() => new NotFound({ message: "user doesn't exist" })),
    );
    return { ...engineer };
  });

type UpdateSelfInfoHandlerContext = {
  readonly payload: {
    readonly name?: string | undefined;
    readonly email?: string | undefined;
    readonly nationality?: string | undefined;
    readonly selfIntro?: string | undefined;
  };
};

const updateSelfInfoHandler = ({ payload }: UpdateSelfInfoHandlerContext) =>
  Ef.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* SqliteDrizzle;

    yield* db
      .update(engineers)
      .set({ ...payload })
      .where(eq(engineers.email, user.email))
      .pipe(
        Ef.mapError(
          () => new InternalServerError({ message: "something went wrong while updating profile" }),
        ),
      );
    return { name: "", email: "", selfIntro: "", profilePic: "", nationality: "" };
  });

type UploadProfilePicHandlerContext = {
  readonly payload: {
    readonly files: Multipart.PersistedFile;
  } & Brand.Brand<typeof HttpApiSchema.MultipartTypeId>;
};

const uploadProfilePicHandler = ({ payload }: UploadProfilePicHandlerContext) =>
  Ef.gen(function* () {
    return { success: true };
  });

export const EngineersApiLive = HttpApiBuilder.group(Api, "engineers", (handlers) =>
  handlers
    .handle("get self info", getSelfInfoHandler)
    .handle("update self info", updateSelfInfoHandler)
    .handle("upload profile picture", uploadProfilePicHandler),
);
