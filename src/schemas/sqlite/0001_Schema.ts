import { relations } from "drizzle-orm";
import * as D from "drizzle-orm/sqlite-core";

import { SKILL_TAGS, USER_ROLES } from "@/Domain";

export const users = D.sqliteTable("users", {
  name: D.text("name").notNull(),
  email: D.text("email").primaryKey(),
  password: D.text("password").notNull(),
  role: D.text("types", { enum: USER_ROLES }).notNull(),
  profilePic: D.blob("profile_picture", { mode: "buffer" }),
});

export const employers = D.sqliteTable("employers", {
  userEmail: D.text("user_email")
    .primaryKey()
    .references(() => users.email, { onDelete: "cascade" }),
  org: D.text("organization").notNull(),
  position: D.text("position").notNull(),
});

export const employersRelations = relations(employers, ({ one }) => ({
  info: one(users, { fields: [employers.userEmail], references: [users.email] }),
}));

export const engineers = D.sqliteTable("engineers", {
  userEmail: D.text("user_email")
    .primaryKey()
    .references(() => users.email, { onDelete: "cascade" }),
  nationality: D.text("nationality").notNull(),
  selfIntro: D.text("self_introduction"),
});

export const engineersRelations = relations(engineers, ({ one }) => ({
  info: one(users, { fields: [engineers.userEmail], references: [users.email] }),
}));

export const admins = D.sqliteTable("admins", {
  userEmail: D.text("user_email")
    .primaryKey()
    .references(() => users.email, { onDelete: "cascade" }),
});

export const adminsRelations = relations(admins, ({ one }) => ({
  info: one(users, { fields: [admins.userEmail], references: [users.email] }),
}));

export const skills = D.sqliteTable("skills", {
  name: D.text("name").primaryKey().unique(),
  tag: D.text("tag", { enum: SKILL_TAGS }).notNull(),
});

export const experiences = D.sqliteTable(
  "experiences",
  {
    yearsOfExp: D.integer("years_of_experience").notNull(),
    engineerEmail: D.text("engineer_email")
      .notNull()
      .references(() => engineers.userEmail),
    skillName: D.text("skill_name")
      .notNull()
      .references(() => skills.name),
  },
  (table) => ({ pk: D.primaryKey({ columns: [table.engineerEmail, table.skillName] }) }),
);
