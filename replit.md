# Scan2Plan BIM Pricing Calculator

## Overview

A professional web-based pricing calculator for Scan-to-BIM (Building Information Modeling) services. This application generates detailed quotes for architectural scanning and modeling projects using either a quick quote or a comprehensive scoping form. It calculates pricing based on building types, square footage/acreage, disciplines (Architecture, Structure, MEPF, Site/Topography), Level of Detail (LoD), risk factors, travel costs, and additional services. The project's vision is to provide a B2B utility tool emphasizing data organization, clarity, and efficient quote generation, with market potential in streamlining the quoting process for BIM service providers and enhancing sales efficiency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses React with TypeScript, Vite for fast development, and Wouter for routing. UI components are built with shadcn/ui (Radix UI primitives) and styled using Tailwind CSS, following a Material Design-inspired aesthetic. State management primarily uses React Query for server state, with local component state for UI interactions. A custom Tailwind-based design system ensures theme consistency and responsiveness. The Calculator page features a two-panel layout: a "Lead Panel" for business and contact information, and a "Quote Panel" for technical scoping and pricing.

### Backend Architecture

The backend is built with Express.js and TypeScript, providing RESTful API endpoints. It uses Zod for request validation and implements a business logic layer with a storage abstraction pattern (IStorage interface) for database operations. Key functionalities include quote management CRUD operations, quote number generation, and data transformation. A dedicated `/api/pricing/calculate` endpoint serves as a stateless pricing engine, allowing external CRM systems to request pricing calculations. The system also includes an Integrity Auditor to enforce business rules and validate quotes before finalization, using a configurable `PRICING_GUARDRAILS.json` file.

### Data Storage Solutions

The application uses PostgreSQL, hosted on Neon, as its primary database, accessed via `@neondatabase/serverless` and Drizzle ORM. Drizzle is used for type-safe queries and schema definition, with `drizzle-zod` for runtime validation. Key data models include `Users`, `Quotes`, `Pricing Matrix` (for base rates), `CAD Pricing Matrix`, and `Pricing Parameters` (for configurable system values). JSONB fields are utilized for flexible storage of complex form data. Pricing parameters, including risk premiums, travel costs, discounts, and service fees, are stored in the database and configurable via an admin UI. Upteam pricing rates are also stored in a database matrix.

## External Dependencies

**UI Component Libraries:**
- `@radix-ui/*`: Headless, accessible component primitives.
- `cmdk`: Command palette component.
- `react-day-picker`: Date selection.
- `lucide-react`: Icon library.
- `class-variance-authority`: Type-safe variant management.

**Form Management:**
- `react-hook-form`: Performant form state management.
- `@hookform/resolvers`: Zod validation integration for forms.

**Data Fetching & State:**
- `@tanstack/react-query`: Server state management, caching, and synchronization.

**Development Tools:**
- `tsx`: TypeScript execution.
- `esbuild`: Fast bundler.
- `postcss`, `autoprefixer`: CSS processing.

**CSV Processing:**
- `csv-parse`: Importing pricing data.

**Utility Libraries:**
- `date-fns`: Date manipulation.
- `clsx`, `tailwind-merge`: Conditional CSS class composition.
- `nanoid`: Unique ID generation.

**Database & ORM:**
- `@neondatabase/serverless`: PostgreSQL driver for Neon.
- `drizzle-orm`: Type-safe ORM.
- `drizzle-zod`: Schema validation from database types.
- `ws`: WebSocket support for Neon connections.

**CRM Integration:**
- External CRM (Scan2Plan-OS) through various API endpoints for bi-directional data flow. Authentication via `CPQ_API_KEY` and `CRM_API_KEY`.