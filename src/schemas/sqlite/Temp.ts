import * as D from "drizzle-orm/sqlite-core";

export const engineers = D.sqliteTable("engineers", {
  id: D.integer("id").primaryKey({ autoIncrement: true }),
  name: D.text("name").notNull(),
  email: D.text("email").unique().notNull(),
  password: D.text("password").notNull(),
  nationality: D.text("nationality").notNull(),
  profilePic: D.blob("profile_picture", { mode: "buffer" }),
  selfIntro: D.text("self_introduction"),
});

export const skillTags = ["programming language", "framework", "dev-tool"] as const;

export const skills = D.sqliteTable("skills", {
  id: D.integer("id").primaryKey({ autoIncrement: true }),
  name: D.text("name").notNull().unique(),
  tag: D.text("tag", { enum: skillTags }).notNull(),
});

export const experiences = D.sqliteTable(
  "experiences",
  {
    yearsOfExp: D.integer("years_of_experience").notNull(),
    engineerId: D.integer("engineer_id")
      .notNull()
      .references(() => engineers.id),
    skillId: D.integer("skill_id")
      .notNull()
      .references(() => skills.id),
  },
  (table) => ({ pk: D.primaryKey({ columns: [table.engineerId, table.skillId] }) }),
);

export const employers = D.sqliteTable("employers", {
  id: D.integer("id").primaryKey({ autoIncrement: true }),
  name: D.text("name").notNull(),
  email: D.text("email").unique().notNull(),
  password: D.text("password").notNull(),
  profilePic: D.blob("profile_picture", { mode: "buffer" }),
  organization: D.text("organization").notNull(),
});
