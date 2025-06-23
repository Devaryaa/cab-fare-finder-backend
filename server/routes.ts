import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBookingSchema, insertRedemptionSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {

  // User registration
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) return res.status(400).json({ message: "User already exists" });

      const user = await storage.createUser(userData);
      res.json({ id: user.id, username: user.username, email: user.email, points: user.points });
    } catch (error: unknown) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  // User login
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) return res.status(401).json({ message: "Invalid credentials" });

      res.json({ id: user.id, username: user.username, email: user.email, points: user.points });
    } catch (error: unknown) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // Get user profile
  app.get("/api/user/:id", async (req: Request, res: Response) => {
    try {
      const id = z.coerce.number().parse(req.params.id);
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ id: user.id, username: user.username, email: user.email, points: user.points });
    } catch (error: unknown) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update user points
  app.patch("/api/user/:id/points", async (req: Request, res: Response) => {
    try {
      const id = z.coerce.number().parse(req.params.id);
      const { points } = z.object({ points: z.number() }).parse(req.body);
      const user = await storage.updateUserPoints(id, points);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ id: user.id, username: user.username, email: user.email, points: user.points });
    } catch (error: unknown) {
      console.error("Update points error:", error);
      res.status(400).json({ message: "Invalid data" });
    }
  });

  // Book a ride and award points
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const pointsEarned = Math.floor(bookingData.distance / 3);
      const bookingWithPoints = { ...bookingData, pointsEarned };
      const booking = await storage.createBooking(bookingWithPoints);

      const user = await storage.getUser(bookingData.userId);
      if (user) {
        const newPoints = user.points + pointsEarned;
        const newDistance = (user.totalDistance || 0) + bookingData.distance;
        await storage.updateUserPoints(user.id, newPoints);
        await storage.updateUserDistance(user.id, newDistance);
      }
      res.json(booking);
    } catch (error: unknown) {
      console.error("Booking error:", error);
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  // Get user bookings
  app.get("/api/bookings/:userId", async (req: Request, res: Response) => {
    try {
      const userId = z.coerce.number().parse(req.params.userId);
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error: unknown) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all rewards
  app.get("/api/rewards", async (_req: Request, res: Response) => {
    try {
      const rewards = await storage.getAllRewards();
      res.json(rewards);
    } catch (error: unknown) {
      console.error("Get rewards error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Redeem a reward
  app.post("/api/redemptions", async (req: Request, res: Response) => {
    try {
      const redemptionData = insertRedemptionSchema.parse(req.body);
      const user = await storage.getUser(redemptionData.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.points < redemptionData.pointsUsed)
        return res.status(400).json({ message: "Insufficient points" });

      const redemption = await storage.createRedemption(redemptionData);
      const newPoints = user.points - redemptionData.pointsUsed;
      await storage.updateUserPoints(user.id, newPoints);

      res.json(redemption);
    } catch (error: unknown) {
      console.error("Redemption error:", error);
      res.status(400).json({ message: "Invalid redemption data" });
    }
  });

  // Get user redemptions
  app.get("/api/redemptions/:userId", async (req: Request, res: Response) => {
    try {
      const userId = z.coerce.number().parse(req.params.userId);
      const redemptions = await storage.getUserRedemptions(userId);
      res.json(redemptions);
    } catch (error: unknown) {
      console.error("Get redemptions error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Fare Comparison API
  app.post("/api/fare", async (req: Request, res: Response) => {
    try {
      const { pickup, drop } = z.object({
        pickup: z.string().min(1),
        drop: z.string().min(1),
      }).parse(req.body);

      const fares = [
        { provider: "Uber", estimate: 220 },
        { provider: "Ola", estimate: 200 },
      ];

      const bengaluruKeywords = ['bengaluru', 'bangalore', 'btm', 'koramangala', 'indiranagar', 'hebbal'];
      const isInBangalore = (address: string) =>
        bengaluruKeywords.some((kw) => address.toLowerCase().includes(kw));

      if (isInBangalore(pickup) && isInBangalore(drop)) {
        fares.push({ provider: "Namma Yatri", estimate: 180 });
      }

      res.json({ fareEstimates: fares });
    } catch (err: unknown) {
      console.error("Fare compare error:", err);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
