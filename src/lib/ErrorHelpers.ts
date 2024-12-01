import type { SqlError } from "@effect/sql";

import { InternalServerError, UnprocessableContent } from "./HttpErrors";

function isRecord(value: unknown): value is Record<string, string> {
  return typeof value === "object";
}

export function handleSqlError(e: SqlError.SqlError) {
  return isRecord(e.cause) && e.cause.code === "SQLITE_CONSTRAINT_UNIQUE"
    ? new UnprocessableContent({ message: "voilate unique constraint" })
    : new InternalServerError({ message: "something went wrong" });
}
