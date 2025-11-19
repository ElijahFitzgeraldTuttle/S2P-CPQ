import { type User, type InsertUser, type Quote, type InsertQuote, quotes, users, pricingMatrix } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quote CRUD operations
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuote(id: string): Promise<Quote | undefined>;
  getAllQuotes(): Promise<Quote[]>;
  updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: string): Promise<boolean>;
  
  // Pricing matrix operations
  getAllPricingRates(): Promise<any[]>;
  getPricingRate(buildingTypeId: number, areaTier: string, discipline: string, lod: string): Promise<any | undefined>;
  updatePricingRate(id: number, ratePerSqFt: string): Promise<any | undefined>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.query.users.findMany({
      where: (u, { eq }) => eq(u.id, id),
      limit: 1,
    });
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.query.users.findMany({
      where: (u, { eq }) => eq(u.username, username),
      limit: 1,
    });
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user!;
  }

  // Quote methods
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const quoteNumber = `Q${Date.now()}`;
    const [newQuote] = await db.insert(quotes).values({
      ...quote,
      quoteNumber,
    }).returning();
    return newQuote!;
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
    return quote;
  }

  async getAllQuotes(): Promise<Quote[]> {
    return db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }

  async updateQuote(id: string, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updatedQuote] = await db
      .update(quotes)
      .set({
        ...quoteData,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, id))
      .returning();
    return updatedQuote;
  }

  async deleteQuote(id: string): Promise<boolean> {
    const result = await db.delete(quotes).where(eq(quotes.id, id)).returning();
    return result.length > 0;
  }
  
  // Pricing matrix methods
  async getAllPricingRates(): Promise<any[]> {
    return db.select().from(pricingMatrix);
  }
  
  async getPricingRate(buildingTypeId: number, areaTier: string, discipline: string, lod: string): Promise<any | undefined> {
    const [rate] = await db
      .select()
      .from(pricingMatrix)
      .where(
        and(
          eq(pricingMatrix.buildingTypeId, buildingTypeId),
          eq(pricingMatrix.areaTier, areaTier),
          eq(pricingMatrix.discipline, discipline),
          eq(pricingMatrix.lod, lod)
        )
      )
      .limit(1);
    return rate;
  }
  
  async updatePricingRate(id: number, ratePerSqFt: string): Promise<any | undefined> {
    const [updated] = await db
      .update(pricingMatrix)
      .set({ 
        ratePerSqFt,
        updatedAt: new Date(),
      })
      .where(eq(pricingMatrix.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DbStorage();
