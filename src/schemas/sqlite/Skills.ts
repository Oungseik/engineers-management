import type { InferSelectModel } from "drizzle-orm";
import * as D from "drizzle-orm/sqlite-core";

export const skillTags = ["programming language", "framework", "dev-tool"] as const;

export const skills = D.sqliteTable("skills", {
  id: D.integer("id").primaryKey({ autoIncrement: true }),
  name: D.text("name").notNull().unique(),
  tag: D.text("tag", { enum: skillTags }).notNull(),
});

export type Skill = InferSelectModel<typeof skills>;
