import { SqlError } from "@effect/sql";

import { InternalServerError, UnprocessableContent } from "./HttpErrors";

export function isRecord(value: unknown): value is Record<string, string> {
  return typeof value === "object";
}

export type SqlErrorCode =
  | "SQLITE_CONSTRAINT_PRIMARYKEY"
  | "SQLITE_CONSTRAINT_UNIQUE"
  | "UNKNOWN_ERROR";

export function getSqlErrorCode(e: SqlError.SqlError): SqlErrorCode {
  return isRecord(e.cause) ? (e.cause.code as SqlErrorCode) : "UNKNOWN_ERROR";
}

export function handleSqlError(e: SqlError.SqlError) {
  return isRecord(e.cause) &&
    (e.cause.code === "SQLITE_CONSTRAINT_UNIQUE" || e.cause.code === "SQLITE_CONSTRAINT_PRIMARYKEY")
    ? new UnprocessableContent({ message: "voilate unique constraint" })
    : new InternalServerError({ message: "something went wrong" });
}
