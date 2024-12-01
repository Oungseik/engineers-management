import { relations } from "drizzle-orm";
import * as D from "drizzle-orm/sqlite-core";

import { engineers } from "./Engineers";
import { experiences } from "./Experiences";
import { skills } from "./Skills";

// ----------------------------------------------------------------------
// Many to many relationship between engineers and skills
// ----------------------------------------------------------------------
export const engineersSkills = D.sqliteTable(
  "engineers_to_skills",
  {
    engineerId: D.integer("engineer_id")
      .notNull()
      .references(() => engineers.id, { onDelete: "cascade" }),
    skillId: D.integer("skill_id").references(() => skills.id),
  },
  (t) => ({ pk: D.primaryKey({ columns: [t.engineerId, t.skillId] }) }),
);

export const engineersRelations = relations(engineers, ({ many }) => ({
  engineersToSkills: many(engineersSkills),
  experiences: many(experiences),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  engineersToSkills: many(engineersSkills),
}));

export const engineersToSkillsRelations = relations(engineersSkills, ({ one }) => ({
  engineer: one(engineers, {
    fields: [engineersSkills.engineerId],
    references: [engineers.id],
  }),
  skill: one(skills, { fields: [engineersSkills.skillId], references: [skills.id] }),
}));
