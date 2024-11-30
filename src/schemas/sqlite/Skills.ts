import type { InferSelectModel } from "drizzle-orm";
import * as D from "drizzle-orm/sqlite-core";

export const skills = D.sqliteTable("skills", {
  id: D.integer("id").primaryKey({ autoIncrement: true }),
  name: D.text("name").notNull(),
  tag: D.text("tag", { enum: ["programming language", "framework", "tool"] }).notNull(),
  years_of_experience: D.integer("years_of_experience").notNull(),
});

export type Skill = InferSelectModel<typeof skills>;
