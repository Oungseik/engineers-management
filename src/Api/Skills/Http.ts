import { HttpApi, HttpApiBuilder } from "@effect/platform";
import { SqliteDrizzle } from "@effect/sql-drizzle/Sqlite";
import { Effect as Ef, Effect } from "effect";

import { InternalServerError } from "@/lib/HttpErrors";
import { handleSqlError } from "@/lib/SqlErrors";
import { skills } from "@/schemas/sqlite";

import { SkillsApi } from "./Api";

const Api = HttpApi.empty.add(SkillsApi);

export const SkillsApiLive = HttpApiBuilder.group(Api, "skills", (handlers) =>
  Ef.gen(function* () {
    const db = yield* SqliteDrizzle;

    return handlers
      .handle("get list of skills", () =>
        db
          .select()
          .from(skills)
          .pipe(
            Effect.catchAll(() => new InternalServerError({ message: "something went wrong" })),
          ),
      )
      .handle("add new skill in a skill list", ({ payload }) =>
        db
          .insert(skills)
          .values({ ...payload, name: payload.name.toLowerCase() })
          .pipe(
            Ef.andThen({ success: true } as const),
            Ef.tapError(Ef.logError),
            Ef.catchTags({ SqlError: handleSqlError }),
          ),
      );
  }),
);
