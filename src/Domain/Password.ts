import { Schema as S } from "effect";

export const Password = S.String.pipe(
  S.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/),
  S.brand("Password"),
  S.annotations({
    title: "Password",
    description:
      "A password which must contain at least one uppercase, one lowercase, one number, and no space.",
  }),
);

export type Password = typeof Password.Type;
