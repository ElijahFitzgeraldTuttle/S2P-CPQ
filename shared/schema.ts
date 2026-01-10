import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, decimal, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User authentication
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

// Pricing reference tables
export const pricingMatrix = pgTable("pricing_matrix", {
  id: integer("id").primaryKey(),
  buildingTypeId: integer("building_type_id").notNull(),
  areaTier: text("area_tier").notNull(),
  discipline: text("discipline").notNull(),
  lod: text("lod").notNull(),
  ratePerSqFt: decimal("rate_per_sq_ft", { precision: 10, scale: 4 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const upteamPricingMatrix = pgTable("upteam_pricing_matrix", {
  id: serial("id").primaryKey(),
  buildingTypeId: integer("building_type_id").notNull(),
  areaTier: text("area_tier").notNull(),
  discipline: text("discipline").notNull(),
  lod: text("lod").notNull(),
  ratePerSqFt: decimal("rate_per_sq_ft", { precision: 10, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cadPricingMatrix = pgTable("cad_pricing_matrix", {
  id: integer("id").primaryKey(),
  buildingTypeId: integer("building_type_id").notNull(),
  areaTier: text("area_tier").notNull(),
  packageType: text("package_type").notNull(),
  ratePerSqFt: decimal("rate_per_sq_ft", { precision: 10, scale: 4 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pricingParameters = pgTable("pricing_parameters", {
  id: integer("id").primaryKey(),
  parameterKey: text("parameter_key").notNull().unique(),
  parameterValue: text("parameter_value").notNull(),
  parameterType: text("parameter_type").notNull(),
  description: text("description"),
  category: text("category"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Main quotes/projects table
export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteNumber: text("quote_number").notNull().unique(),
  
  // Project details
  clientName: text("client_name"),
  projectName: text("project_name").notNull(),
  projectAddress: text("project_address").notNull(),
  specificBuilding: text("specific_building"),
  typeOfBuilding: text("type_of_building").notNull(),
  hasBasement: boolean("has_basement").default(false),
  hasAttic: boolean("has_attic").default(false),
  notes: text("notes"),
  
  // Mode
  scopingMode: boolean("scoping_mode").default(false).notNull(),
  
  // Areas (stored as JSON)
  areas: jsonb("areas").notNull(),
  
  // Risk factors
  risks: jsonb("risks").default('[]').notNull(),
  
  // Travel
  dispatchLocation: text("dispatch_location").notNull(),
  distance: integer("distance"),
  customTravelCost: decimal("custom_travel_cost", { precision: 12, scale: 2 }),
  
  // Additional services
  services: jsonb("services").default('{}').notNull(),
  
  // Scoping data (only if scoping mode enabled)
  scopingData: jsonb("scoping_data"),
  
  // Calculated pricing
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }),
  pricingBreakdown: jsonb("pricing_breakdown"),
  
  // Version control
  parentQuoteId: varchar("parent_quote_id"),
  versionNumber: integer("version_number").default(1).notNull(),
  versionName: text("version_name"),
  
  // Scan2Plan-OS Integration
  leadId: integer("lead_id"),
  
  // Integrity Audit
  integrityStatus: text("integrity_status").default("pass"), // 'pass' | 'warning' | 'blocked'
  integrityFlags: jsonb("integrity_flags").default('[]'),
  requiresOverride: boolean("requires_override").default(false),
  overrideApproved: boolean("override_approved").default(false),
  overrideApprovedBy: text("override_approved_by"),
  overrideApprovedAt: timestamp("override_approved_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  quoteNumber: true,
  createdAt: true,
  updatedAt: true,
  overrideApprovedAt: true,
});

export const updateQuoteSchema = insertQuoteSchema.partial();

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

// QuickBooks OAuth tokens storage
export const quickbooksTokens = pgTable("quickbooks_tokens", {
  id: serial("id").primaryKey(),
  realmId: text("realm_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  accessTokenExpiresAt: timestamp("access_token_expires_at").notNull(),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type QuickBooksTokens = typeof quickbooksTokens.$inferSelect;

// Audit Exceptions table for CEO override workflow
export const auditExceptions = pgTable("audit_exceptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: varchar("quote_id").notNull(),
  requestedBy: text("requested_by"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'approved' | 'rejected'
  flagCodes: jsonb("flag_codes").default('[]').notNull(), // Which flags triggered the exception
  justification: text("justification"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
});

export const insertAuditExceptionSchema = createInsertSchema(auditExceptions).omit({
  id: true,
  requestedAt: true,
});

export type InsertAuditException = z.infer<typeof insertAuditExceptionSchema>;
export type AuditException = typeof auditExceptions.$inferSelect;

// Projects Actuals table for sqft verification against historical scans
export const projectsActuals = pgTable("projects_actuals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  normalizedAddress: text("normalized_address").notNull(),
  actualSqft: integer("actual_sqft").notNull(),
  lastScanDate: timestamp("last_scan_date").notNull(),
  scanNotes: text("scan_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProjectActuals = typeof projectsActuals.$inferSelect;

// ============================================================================
// PRICING CALCULATION API SCHEMAS (for CRM Integration)
// ============================================================================

// Area discipline configuration
export const disciplineLodSchema = z.object({
  discipline: z.string(), // 'arch', 'mepf', 'structure', 'site'
  lod: z.string(), // '200', '300', '350'
  scope: z.string().optional(), // 'full', 'interior', 'exterior', 'mixed'
  interiorLod: z.string().optional(),
  exteriorLod: z.string().optional(),
});

// Single area input
export const pricingAreaSchema = z.object({
  name: z.string().optional(),
  buildingType: z.string(), // building type ID as string
  squareFeet: z.string(), // sqft or acres for landscape
  disciplines: z.array(z.string()).optional(), // enabled discipline IDs
  disciplineLods: z.record(z.string(), disciplineLodSchema).optional(),
});

// Services configuration
export const pricingServicesSchema = z.object({
  matterport: z.boolean().optional(),
  actScan: z.boolean().optional(),
  additionalElevations: z.number().optional(),
});

// Main request schema
export const pricingCalculationRequestSchema = z.object({
  // Project metadata (optional, for context)
  clientName: z.string().optional(),
  projectName: z.string().optional(),
  projectAddress: z.string().optional(),
  
  // Core pricing inputs
  areas: z.array(pricingAreaSchema),
  risks: z.array(z.string()).default([]), // 'occupied', 'hazardous', 'no_power'
  
  // Travel
  dispatchLocation: z.string(), // 'troy', 'woodstock', 'brooklyn', 'fly_out'
  distance: z.number().default(0),
  customTravelCost: z.number().optional(),
  
  // Services
  services: pricingServicesSchema.optional(),
  
  // Payment terms
  paymentTerms: z.string().default('partner'), // 'partner', 'owner', 'net30', 'net60', 'net90'
  
  // Optional: Lead ID for CRM tracking
  leadId: z.number().optional(),
});

// Line item in response
export const pricingLineItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.string(), // 'area', 'discipline', 'travel', 'risk', 'service', 'discount', 'subtotal', 'total'
  clientPrice: z.number(),
  upteamCost: z.number().optional(),
  details: z.record(z.string(), z.any()).optional(),
});

// Response schema
export const pricingCalculationResponseSchema = z.object({
  success: z.boolean(),
  
  // Summary
  totalClientPrice: z.number(),
  totalUpteamCost: z.number(),
  grossMargin: z.number(),
  grossMarginPercent: z.number(),
  
  // Detailed breakdown
  lineItems: z.array(pricingLineItemSchema),
  
  // Aggregates by category
  subtotals: z.object({
    modeling: z.number(),
    travel: z.number(),
    riskPremiums: z.number(),
    services: z.number(),
    paymentPremium: z.number(),
  }),
  
  // Integrity validation
  integrityStatus: z.enum(['pass', 'warning', 'blocked']),
  integrityFlags: z.array(z.object({
    code: z.string(),
    message: z.string(),
    severity: z.enum(['info', 'warning', 'error']),
  })),
  
  // Metadata
  calculatedAt: z.string(),
  engineVersion: z.string(),
});

export type DisciplineLod = z.infer<typeof disciplineLodSchema>;
export type PricingArea = z.infer<typeof pricingAreaSchema>;
export type PricingServices = z.infer<typeof pricingServicesSchema>;
export type PricingCalculationRequest = z.infer<typeof pricingCalculationRequestSchema>;
export type PricingLineItem = z.infer<typeof pricingLineItemSchema>;
export type PricingCalculationResponse = z.infer<typeof pricingCalculationResponseSchema>;
