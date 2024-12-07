import { Schema as S } from "effect";

export const Password = S.String.pipe(
  S.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@.#$!%*?&]{8,15}$/),
  S.brand("Password"),
  S.annotations({
    title: "Password",
    description:
      "A password which must contain at least one uppercase, one lowercase, and one number",
  }),
);
