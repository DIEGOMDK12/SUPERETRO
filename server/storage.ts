import { type User, type InsertUser, type Game, type InsertGame, type Save, type InsertSave, users, games, saves } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  deleteGame(id: number): Promise<boolean>;
  getSave(gameId: string): Promise<Save | undefined>;
  createSave(save: InsertSave): Promise<Save>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getGames(): Promise<Game[]> {
    return db.select().from(games);
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values({
      ...insertGame,
      core: insertGame.core || "snes",
    }).returning();
    return game;
  }

  async deleteGame(id: number): Promise<boolean> {
    const result = await db.delete(games).where(eq(games.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getSave(gameId: string): Promise<Save | undefined> {
    const [save] = await db.select().from(saves).where(eq(saves.gameId, gameId)).orderBy(desc(saves.id)).limit(1);
    return save;
  }

  async createSave(insertSave: InsertSave): Promise<Save> {
    await db.delete(saves).where(eq(saves.gameId, insertSave.gameId));
    const [save] = await db.insert(saves).values(insertSave).returning();
    return save;
  }
}

export const storage = new DatabaseStorage();
