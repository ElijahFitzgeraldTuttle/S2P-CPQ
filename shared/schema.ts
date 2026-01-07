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
