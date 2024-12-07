import * as D from "drizzle-orm/sqlite-core";

const USER_TYPES = ["ENGINEER", "EMPLOYER", "ADMIN"] as const;
export const SKILL_TAGS = ["programming language", "framework", "dev-tool"] as const;

export const skills = D.sqliteTable("skills", {
  id: D.integer("id").primaryKey({ autoIncrement: true }),
  name: D.text("name").notNull().unique(),
  tag: D.text("tag", { enum: SKILL_TAGS }).notNull(),
});

export const users = D.sqliteTable("users", {
  id: D.integer("id").primaryKey({ autoIncrement: true }),
  name: D.text("name").notNull(),
  email: D.text("email").unique().notNull(),
  password: D.text("password").notNull(),
  types: D.text("types", { enum: USER_TYPES }).notNull(),
  profilePic: D.blob("profile_picture", { mode: "buffer" }),
});

export const employers = D.sqliteTable("employers", {
  userId: D.integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  org: D.text("organization").notNull(),
  position: D.text("position").notNull(),
});

export const engineers = D.sqliteTable("engineers", {
  userId: D.integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const admins = D.sqliteTable("admins", {
  userId: D.integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const experiences = D.sqliteTable(
  "experiences",
  {
    yearsOfExp: D.integer("years_of_experience").notNull(),
    engineerId: D.integer("engineer_id")
      .notNull()
      .references(() => engineers.userId),
    skillId: D.integer("skill_id")
      .notNull()
      .references(() => skills.id),
  },
  (table) => ({ pk: D.primaryKey({ columns: [table.engineerId, table.skillId] }) }),
);
