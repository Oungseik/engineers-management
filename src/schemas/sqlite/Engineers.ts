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
