import { 
  users, bookings, rewards, redemptions, 
  type User, type InsertUser , 
  type Booking, type InsertBooking, 
  type Reward, type Redemption, type InsertRedemption 
} from "../shared/schema.js"; // Adjusted import path
import { db } from "./db.js";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser (id: number): Promise<User | undefined>;
  getUser ByUsername(username: string): Promise<User | undefined>; // Fixed method name
  getUser ByEmail(email: string): Promise<User | undefined>; // Fixed method name
  createUser (user: InsertUser ): Promise<User>;
  updateUser Points(id: number, points: number): Promise<User | undefined>; // Fixed method name

  // Booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUser Bookings(userId: number): Promise<Booking[]>; // Fixed method name

  // Rewards methods
  getAllRewards(): Promise<Reward[]>;
  createReward(reward: Omit<Reward, 'id' | 'createdAt'>): Promise<Reward>;

  // Redemption methods
  createRedemption(redemption: InsertRedemption): Promise<Redemption>;
  getUser Redemptions(userId: number): Promise<Redemption[]>; // Fixed method name
  updateUser Distance(userId: number, distance: number): Promise<User | undefined>; // Fixed method name
}

export class DatabaseStorage implements IStorage {
  async getUser (id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUser ByUsername(username: string): Promise<User | undefined> { // Fixed method name
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUser ByEmail(email: string): Promise<User | undefined> { // Fixed method name
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser (insert: InsertUser ): Promise<User> { // Fixed parameter type
    const [user] = await db.insert(users).values(insert).returning(); // Fixed parameter name
    return user;
  }

  async updateUser Points(id: number, points: number): Promise<User | undefined> { // Fixed method name
    const [user] = await db.update(users)
      .set({ points })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getUser Bookings(userId: number): Promise<Booking[]> { // Fixed method name
    return await db.select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.bookingDate));
  }

  async getAllRewards(): Promise<Reward[]> {
    return await db.select()
      .from(rewards)
      .where(eq(rewards.isActive, true));
  }

  async createReward(reward: Omit<Reward, 'id' | 'createdAt'>): Promise<Reward> {
    const [newReward] = await db.insert(rewards).values(reward).returning();
    return newReward;
  }

  async createRedemption(redemption: InsertRedemption): Promise<Redemption> {
    const [newRedemption] = await db.insert(redemptions).values(redemption).returning();
    return newRedemption;
  }

  async getUser Redemptions(userId: number): Promise<Redemption[]> { // Fixed method name
    return await db.select()
      .from(redemptions)
      .where(eq(redemptions.userId, userId))
      .orderBy(desc(redemptions.redeemedAt));
  }

  async updateUser Distance(userId: number, distance: number): Promise<User | undefined> { // Fixed method name
    const [user] = await db.update(users)
      .set({ totalDistance: distance })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }
}

export const storage = new DatabaseStorage();
