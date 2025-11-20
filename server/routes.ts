import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/objects/finalize", async (req, res) => {
    if (!req.body.fileURL) {
      return res.status(400).json({ error: "fileURL is required" });
    }
    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.fileURL,
      );
      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error finalizing upload:", error);
      res.status(500).json({ error: "Internal server error" });
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

  // Upteam pricing matrix routes
  app.get("/api/upteam-pricing-matrix", async (req, res) => {
    try {
      const allRates = await storage.getAllUpteamPricingRates();
      res.json(allRates);
    } catch (error) {
      console.error("Error fetching upteam pricing rates:", error);
      res.status(500).json({ error: "Failed to fetch upteam pricing rates" });
    }
  });

  app.patch("/api/upteam-pricing-matrix/:id", async (req, res) => {
    try {
      const { ratePerSqFt } = req.body;
      if (!ratePerSqFt) {
        return res.status(400).json({ error: "ratePerSqFt is required" });
      }
      
      const updated = await storage.updateUpteamPricingRate(parseInt(req.params.id), ratePerSqFt);
      if (!updated) {
        return res.status(404).json({ error: "Upteam pricing rate not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating upteam pricing rate:", error);
      res.status(500).json({ error: "Failed to update upteam pricing rate" });
    }
  });

  // Pricing parameters routes
  app.get("/api/pricing-parameters", async (req, res) => {
    try {
      const allParameters = await storage.getAllPricingParameters();
      // Convert parameterValue to number for numeric types
      const typedParameters = allParameters.map(param => ({
        ...param,
        parameterValue: (param.parameterType === 'number' || param.parameterType === 'percentage') 
          ? Number(param.parameterValue)
          : param.parameterValue
      }));
      res.json(typedParameters);
    } catch (error) {
      console.error("Error fetching pricing parameters:", error);
      res.status(500).json({ error: "Failed to fetch pricing parameters" });
    }
  });

  app.patch("/api/pricing-parameters/:id", async (req, res) => {
    try {
      const { parameterValue } = req.body;
      if (parameterValue === undefined || parameterValue === null || parameterValue === "") {
        return res.status(400).json({ error: "parameterValue is required and cannot be empty" });
      }
      
      // Validate that the parameter value is a number or can be converted to one
      const numericValue = Number(parameterValue);
      if (isNaN(numericValue)) {
        return res.status(400).json({ error: "parameterValue must be a valid number" });
      }
      
      // Store as string in database but maintain numeric precision
      const updated = await storage.updatePricingParameter(parseInt(req.params.id), numericValue.toString());
      if (!updated) {
        return res.status(404).json({ error: "Pricing parameter not found" });
      }
      
      // Return with proper numeric type in response
      const typedResponse = {
        ...updated,
        parameterValue: (updated.parameterType === 'number' || updated.parameterType === 'percentage')
          ? Number(updated.parameterValue)
          : updated.parameterValue
      };
      
      res.json(typedResponse);
    } catch (error) {
      console.error("Error updating pricing parameter:", error);
      res.status(500).json({ error: "Failed to update pricing parameter" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
