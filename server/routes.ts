import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const privateDir = process.env.PRIVATE_OBJECT_DIR;
      if (!privateDir) {
        return res.status(500).json({ error: "Object storage not configured" });
      }

      const timestamp = Date.now();
      const safeFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${safeFilename}`;
      const filepath = join(privateDir, filename);

      // Ensure the directory exists
      await mkdir(dirname(filepath), { recursive: true });
      
      await writeFile(filepath, req.file.buffer);

      const url = `/objstore${filepath}`;

      res.json({
        url,
        filename: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Quote routes
  app.get("/api/quotes", async (req, res) => {
    try {
      const allQuotes = await storage.getAllQuotes();
      res.json(allQuotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      const newQuote = await storage.createQuote(validatedData);
      res.status(201).json(newQuote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid quote data", details: error.errors });
      }
      console.error("Error creating quote:", error);
      res.status(500).json({ error: "Failed to create quote" });
    }
  });

  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.partial().parse(req.body);
      const updatedQuote = await storage.updateQuote(req.params.id, validatedData);
      if (!updatedQuote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.json(updatedQuote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid quote data", details: error.errors });
      }
      console.error("Error updating quote:", error);
      res.status(500).json({ error: "Failed to update quote" });
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteQuote(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting quote:", error);
      res.status(500).json({ error: "Failed to delete quote" });
    }
  });

  app.post("/api/calculate-distance", async (req, res) => {
    try {
      const { origin, destination } = req.body;
      
      if (!origin || !destination) {
        return res.status(400).json({ error: "Origin and destination are required" });
      }

      const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
      if (!MAPBOX_TOKEN) {
        return res.status(500).json({ error: "Mapbox API token not configured" });
      }

      const DISPATCH_COORDS: Record<string, [number, number]> = {
        troy: [-73.6918, 42.7284],
        woodstock: [-74.1182, 42.0409],
        brooklyn: [-73.9442, 40.6782],
      };

      const originCoords = DISPATCH_COORDS[origin.toLowerCase()];
      if (!originCoords) {
        return res.status(400).json({ error: "Invalid dispatch location" });
      }

      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
      const geocodeResponse = await fetch(geocodeUrl);
      
      if (!geocodeResponse.ok) {
        throw new Error("Failed to geocode destination address");
      }

      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData.features || geocodeData.features.length === 0) {
        return res.status(404).json({ error: "Address not found" });
      }

      const destCoords = geocodeData.features[0].geometry.coordinates;

      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?access_token=${MAPBOX_TOKEN}`;
      const directionsResponse = await fetch(directionsUrl);
      
      if (!directionsResponse.ok) {
        throw new Error("Failed to calculate route");
      }

      const directionsData = await directionsResponse.json();
      
      if (!directionsData.routes || directionsData.routes.length === 0) {
        return res.status(404).json({ error: "No route found" });
      }

      const distanceMeters = directionsData.routes[0].distance;
      const distanceMiles = Math.round(distanceMeters / 1609.34);

      res.json({ 
        distance: distanceMiles,
        origin: origin,
        destination: destination,
        formattedAddress: geocodeData.features[0].place_name
      });
    } catch (error) {
      console.error("Error calculating distance:", error);
      res.status(500).json({ error: "Failed to calculate distance" });
    }
  });

  // Pricing matrix routes
  app.get("/api/pricing-matrix", async (req, res) => {
    try {
      const allRates = await storage.getAllPricingRates();
      res.json(allRates);
    } catch (error) {
      console.error("Error fetching pricing rates:", error);
      res.status(500).json({ error: "Failed to fetch pricing rates" });
    }
  });
  
  app.patch("/api/pricing-matrix/:id", async (req, res) => {
    try {
      const { ratePerSqFt } = req.body;
      if (!ratePerSqFt) {
        return res.status(400).json({ error: "ratePerSqFt is required" });
      }
      
      const updated = await storage.updatePricingRate(parseInt(req.params.id), ratePerSqFt);
      if (!updated) {
        return res.status(404).json({ error: "Pricing rate not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating pricing rate:", error);
      res.status(500).json({ error: "Failed to update pricing rate" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
