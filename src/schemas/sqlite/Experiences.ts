import { relations } from "drizzle-orm";
import * as D from "drizzle-orm/sqlite-core";

import { engineers } from "./Engineers";
import { skills } from "./Skills";

export const experiences = D.sqliteTable("experiences", {
  id: D.integer("id").primaryKey({ autoIncrement: true }),
  yearsOfExp: D.integer("years_of_experience").notNull(),
  engineerId: D.integer("engineer_id")
    .notNull()
    .references(() => engineers.id, { onDelete: "cascade" }),
  skillId: D.integer("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "set null" }),
});

export const experiencesRelations = relations(experiences, ({ one }) => ({
  experiencesToEngineers: one(engineers, {
    fields: [experiences.engineerId],
    references: [engineers.id],
  }),
  experiencesToSkills: one(skills, {
    fields: [experiences.skillId],
    references: [skills.id],
  }),
}));
