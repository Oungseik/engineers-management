import { Schema as S } from "effect";

export class User extends S.Class<User>("User")({
  email: S.NonEmptyString,
}) {}

export * from "./AdminAuthorization";
export * from "./EmployerAuthorization";
export * from "./EngineerAuthorization";
export * from "./UserAuthorization";
