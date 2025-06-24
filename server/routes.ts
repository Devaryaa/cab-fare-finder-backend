import type { Express, Request, Response } from "express";
import { storage } from "./storage.js";
import { insertUser Schema, insertBookingSchema, insertRedemptionSchema } from "../shared/schema.js"; // Adjusted import path
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<void> {
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUser Schema.parse(req.body);
      const existingUser  = await storage.getUser ByEmail(userData.email);
      if (existingUser ) return res.status(400).json({ message: "User  already exists" });

      const user = await storage.createUser (userData);
      res.json({ id: user.id, username: user.username, email: user.email, points: user.points });
    } catch {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUser ByEmail(email);
      if (!user || user.password !== password)
        return res.status(401).json({ message: "Invalid credentials" });

      res.json({ id: user.id, username: user.username, email: user.email, points: user.points });
    } catch {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.get("/api/user/:id", async (req: Request, res: Response) => {
    try {
      const id = z.coerce.number().parse(req.params.id);
      const user = await storage.getUser (id);
      if (!user) return res.status(404).json({ message: "User  not found" });

      res.json({ id: user.id, username: user.username, email: user.email, points: user.points });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/user/:id/points", async (req: Request, res: Response) => {
    try {
      const id = z.coerce.number().parse(req.params.id);
      const { points } = z.object({ points: z.number() }).parse(req.body);
      const user = await storage.updateUser Points(id, points);
      if (!user) return res.status(404).json({ message: "User  not found" });

      res.json(user);
    } catch {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const pointsEarned = Math.floor(bookingData.distance / 3);
      const booking = await storage.createBooking({ ...bookingData, pointsEarned });

      const user = await storage.getUser (bookingData.userId);
      if (user) {
        await storage.updateUser Points(user.id, user.points + pointsEarned);
        await storage.updateUser Distance(user.id, (user.totalDistance || 0) + bookingData.distance);
      }
      res.json(booking);
    } catch {
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.get("/api/bookings/:userId", async (req: Request, res: Response) => {
    try {
      const userId = z.coerce.number().parse(req.params.userId);
      const bookings = await storage.getUser Bookings(userId);
      res.json(bookings);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/rewards", async (_req: Request, res: Response) => {
    try {
      const rewards = await storage.getAllRewards();
      res.json(rewards);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/redemptions", async (req: Request, res: Response) => {
    try {
      const redemptionData = insertRedemptionSchema.parse(req.body);
      const user = await storage.getUser (redemptionData.userId);
      if (!user) return res.status(404).json({ message: "User  not found" });
      if (user.points < redemptionData.pointsUsed)
        return res.status(400).json({ message: "Insufficient points" });

      const redemption = await storage.createRedemption(redemptionData);
      await storage.updateUser Points(user.id, user.points - redemptionData.pointsUsed);
      res.json(redemption);
    } catch {
      res.status(400).json({ message: "Invalid redemption data" });
    }
  });

  app.get("/api/redemptions/:userId", async (req: Request, res: Response) => {
    try {
      const userId = z.coerce.number().parse(req.params.userId);
      const redemptions = await storage.getUser Redemptions(userId);
      res.json(redemptions);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/fare", async (req: Request, res: Response) => {
    try {
      const { pickup, drop } = z.object({ pickup: z.string(), drop: z.string() }).parse(req.body);
      const fares = [
        { provider: "Uber", estimate: 220 },
        { provider: "Ola", estimate: 200 },
      ];
      const inBangalore = (addr: string) =>
        ['bengaluru', 'bangalore', 'btm', 'koramangala', 'indiranagar', 'hebbal']
          .some(kw => addr.toLowerCase().includes(kw));
      if (inBangalore(pickup) && inBangalore(drop))
        fares.push({ provider: "Namma Yatri", estimate: 180 });
      res.json({ fareEstimates: fares });
    } catch {
      res.status(400).json({ message: "Invalid request" });
    }
  });
}
