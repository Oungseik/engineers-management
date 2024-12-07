import { Schema } from "effect";

export const Email = Schema.String.pipe(
  Schema.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
  Schema.brand("Email"),
  Schema.annotations({
    title: "Email",
    description: "An email address",
  }),
);

export type Email = typeof Email.Type;
