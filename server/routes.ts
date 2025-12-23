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

  // CAD pricing matrix routes
  app.get("/api/cad-pricing-matrix", async (req, res) => {
    try {
      const allRates = await storage.getAllCadPricingRates();
      res.json(allRates);
    } catch (error) {
      console.error("Error fetching CAD pricing rates:", error);
      res.status(500).json({ error: "Failed to fetch CAD pricing rates" });
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
      
      // Fetch existing parameter to check its type
      const allParameters = await storage.getAllPricingParameters();
      const existingParam = allParameters.find(p => p.id === parseInt(req.params.id));
      
      if (!existingParam) {
        return res.status(404).json({ error: "Pricing parameter not found" });
      }
      
      // Validate based on parameter type
      let valueToStore: string;
      const isNumericType = existingParam.parameterType === 'number' || existingParam.parameterType === 'percentage';
      
      if (isNumericType) {
        const numericValue = Number(parameterValue);
        if (isNaN(numericValue)) {
          return res.status(400).json({ error: `Parameter '${existingParam.parameterKey}' requires a numeric value` });
        }
        valueToStore = numericValue.toString();
      } else {
        valueToStore = String(parameterValue);
      }
      
      // Store in database
      const updated = await storage.updatePricingParameter(parseInt(req.params.id), valueToStore);
      if (!updated) {
        return res.status(404).json({ error: "Pricing parameter not found" });
      }
      
      // Return with proper type in response
      const typedResponse = {
        ...updated,
        parameterValue: isNumericType 
          ? Number(updated.parameterValue)
          : updated.parameterValue
      };
      
      res.json(typedResponse);
    } catch (error) {
      console.error("Error updating pricing parameter:", error);
      res.status(500).json({ error: "Failed to update pricing parameter" });
    }
  });

  // PandaDoc integration endpoint
  app.post("/api/pandadoc/create", async (req, res) => {
    try {
      const API_KEY = process.env.PANDADOC_API_KEY;
      const TEMPLATE_UUID = process.env.PANDADOC_TEMPLATE_UUID;
      
      if (!API_KEY || !TEMPLATE_UUID) {
        return res.status(500).json({ error: "PandaDoc API key or template UUID not configured" });
      }
      
      const data = req.body;
      
      // Extract core details
      const projectDetails = data.projectDetails || {};
      const projectAddress = projectDetails.projectAddress || "No Address Provided";
      const crmData = data.crmData || {};
      const contactEmail = crmData.accountContactEmail || "";
      
      // Handle Name
      const rawContact = crmData.accountContact || "";
      let first = "";
      let last = "";
      if (rawContact.includes(',')) {
        const parts = rawContact.split(', ');
        first = parts.length > 1 ? parts[1] : parts[0];
        last = parts[0];
      } else {
        const parts = rawContact.split(' ');
        first = parts[0] || "";
        last = parts.slice(1).join(' ') || "";
      }
      
      // Area & Scope Logic
      const areas = data.areas || [];
      const typeMap: Record<string, string> = {
        "1": "Residential - Single Family", "2": "Residential - Multi Family",
        "3": "Residential - Luxury", "4": "Commercial / Office",
        "5": "Retail / Restaurants", "6": "Kitchen / Catering Facilities",
        "7": "Education", "8": "Hotel / Theatre / Museum",
        "9": "Hospitals / Mixed Use", "10": "Mechanical / Utility Rooms",
        "11": "Warehouse / Storage", "12": "Religious Buildings",
        "13": "Infrastructure", "14": "Built Landscape",
        "15": "Natural Landscape", "16": "ACT (Ceiling Tiles)"
      };
      
      // Service Line (Header)
      const primaryArea = areas[0] || {};
      const bTypeId = String(primaryArea.buildingType || '4');
      const typeLabel = typeMap[bTypeId] || "Standard";
      
      const servicePrefix = ["1", "2", "3"].includes(bTypeId) 
        ? "Residential Service" 
        : "Commercial Service";
      const serviceLine = `${servicePrefix} for ${projectAddress} - ${typeLabel}`;
      
      // Build "Project.AreasList"
      const allDisciplines = new Set<string>();
      const areaDescriptions: string[] = [];
      
      for (const area of areas) {
        const name = area.name || 'Area';
        const sqft = parseInt(area.squareFeet) || 0;
        const lod = area.disciplineLods?.architecture || '300';
        const disciplines = area.disciplines || [];
        
        for (const d of disciplines) allDisciplines.add(d);
        if (area.gradeAroundBuilding) allDisciplines.add('grade');
        
        const extras: string[] = [];
        if (disciplines.includes('mepf')) extras.push("MEPF");
        if (disciplines.includes('structure')) extras.push("Structure");
        if (disciplines.includes('site') || area.gradeAroundBuilding) extras.push("Site/Grade");
        if (disciplines.includes('matterport')) extras.push("Matterport");
        
        const extrasStr = extras.join(" + ");
        const sqftFormatted = sqft.toLocaleString();
        const desc = extrasStr 
          ? `• ${name}: ${sqftFormatted} sqft - LoD ${lod} + ${extrasStr}`
          : `• ${name}: ${sqftFormatted} sqft - LoD ${lod}`;
        areaDescriptions.push(desc);
      }
      
      const areasListBlock = areaDescriptions.join("\n");
      
      // Build Scope & Deliverables Lists
      const scopeItems = [
        "End-to-end project management and customer service",
        "LiDAR Scan - A scanning technician will capture the interior and exterior."
      ];
      if (allDisciplines.has('matterport')) {
        scopeItems.push("Matterport Scan - A scanning technician will capture the interior.");
      }
      scopeItems.push("Registration - Point cloud data registered, cleaned, and reviewed.");
      scopeItems.push("BIM Modeling - Revit model creation.");
      scopeItems.push("QA/QC - Redundant review by engineering staff.");
      
      const scopeBullets = scopeItems.map(item => `• ${item}`).join("\n");
      
      // Deliverables
      const delivItems = ["Total Square Footage Audit"];
      const globalScopeParts = ["LoD 300"];
      if (allDisciplines.has('mepf')) globalScopeParts.push("MEPF");
      if (allDisciplines.has('structure')) globalScopeParts.push("Structure");
      if (allDisciplines.has('site') || allDisciplines.has('grade')) globalScopeParts.push("Site/Grade");
      
      delivItems.push(`Revit Model - ${globalScopeParts.join(' + ')}`);
      if (allDisciplines.has('matterport')) {
        delivItems.push("Matterport 3D Tour");
      }
      delivItems.push("Colorized Point Cloud (.rcp format)");
      const delivBullets = delivItems.map(item => `• ${item}`).join("\n");
      
      // Format Pricing Table Rows
      const pricing = data.pricing || {};
      const lineItems = pricing.lineItems || [];
      const rows = lineItems
        .filter((item: any) => !item.isTotal)
        .map((item: any) => ({
          options: { qty: 1, name: item.label || 'Service', price: item.value || 0 },
          data: { name: item.label || 'Service', price: item.value || 0, qty: 1 }
        }));
      
      // Construct Payload
      const payload = {
        name: `Proposal: ${projectAddress}`,
        template_uuid: TEMPLATE_UUID,
        recipients: [{ email: contactEmail, first_name: first, last_name: last, role: "Client" }],
        tokens: [
          { name: "Project.Address", value: projectAddress },
          { name: "Project.ServiceLine", value: serviceLine },
          { name: "Project.AreasList", value: areasListBlock },
          { name: "Scope.List", value: scopeBullets },
          { name: "Deliverables.List", value: delivBullets }
        ],
        pricing_tables: [
          {
            name: "Pricing Table 1",
            sections: [{ title: "Services Scope", default: true, rows }]
          }
        ]
      };
      
      // Execute PandaDoc API call
      const response = await fetch("https://api.pandadoc.com/public/v1/documents", {
        method: "POST",
        headers: {
          "Authorization": `API-Key ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (response.status === 201) {
        const result = await response.json();
        const docId = result.id;
        const docUrl = `https://app.pandadoc.com/a/#/documents/${docId}`;
        res.json({ success: true, documentId: docId, documentUrl: docUrl });
      } else {
        const errorText = await response.text();
        console.error("PandaDoc API error:", errorText);
        res.status(response.status).json({ error: "PandaDoc API error", details: errorText });
      }
    } catch (error) {
      console.error("Error creating PandaDoc document:", error);
      res.status(500).json({ error: "Failed to create PandaDoc document" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
