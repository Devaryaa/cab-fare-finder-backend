import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { seedRewards } from "./seedRewards";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json.bind(res);
  res.json = function (bodyJson: any) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      console.log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(app);

  const port = process.env.PORT ? Number(process.env.PORT) : 5000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server running on http://0.0.0.0:${port}`);
  });
})();
