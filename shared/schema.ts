import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  core: text("core").notNull().default("snes"),
  cover: text("cover").notNull(),
  rom: text("rom").notNull(),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export const saves = pgTable("saves", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull(),
  saveData: text("save_data").notNull(),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const insertSaveSchema = createInsertSchema(saves).omit({
  id: true,
  createdAt: true,
});

export type InsertSave = z.infer<typeof insertSaveSchema>;
export type Save = typeof saves.$inferSelect;

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  data: text("data").notNull(),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
});

export type InsertFile = z.infer<typeof insertFileSchema>;
export type FileRecord = typeof files.$inferSelect;

export const capybaras = pgTable("capybaras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  location: text("location"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const insertCapybaraSchema = createInsertSchema(capybaras).omit({
  id: true,
  createdAt: true,
});

export type InsertCapybara = z.infer<typeof insertCapybaraSchema>;
export type Capybara = typeof capybaras.$inferSelect;
