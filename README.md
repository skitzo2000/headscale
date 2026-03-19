# Forms PWA Platform

A brandable, white-label forms platform built as a Progressive Web App. Create, share, and collect responses with fully customizable branding for each deployment.

## Tech Stack

- **Frontend**: SvelteKit with Tailwind CSS
- **Backend**: Express with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Infrastructure**: Docker Compose for local development and deployment
- **Future**: Native mobile apps via Capacitor

## Quick Start

```bash
# Start the database
docker-compose up -d

# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
```

## Branding

The platform supports full white-label branding. Each brand is defined by a configuration folder inside `brands/`.

### Creating a New Brand

1. Create a new directory under `brands/` with your brand identifier:

   ```
   brands/
     my-brand/
       brand.json
   ```

2. Define your brand configuration in `brand.json`:

   ```json
   {
     "name": "My Brand",
     "logo": null,
     "colors": {
       "primary": "#4F46E5",
       "secondary": "#10B981",
       "background": "#FFFFFF",
       "surface": "#F9FAFB",
       "text": "#111827"
     },
     "metadata": {
       "title": "My Brand Forms",
       "description": "Custom forms by My Brand"
     },
     "features": {
       "registration": true,
       "publicForms": true,
       "csvExport": true,
       "responseNotifications": false
     }
   }
   ```

3. Set the `BRAND` environment variable to your brand identifier when running the app:

   ```bash
   BRAND=my-brand npm run dev
   ```

Any fields omitted from `brand.json` will fall back to sensible defaults defined in the config schema.

### Included Brands

- **default** -- The standard Forms Platform branding
- **acme** -- Example corporate branding with warm colors and all features enabled
- **starter** -- A minimal/free-tier brand with limited features

## Architecture

This project is organized as a monorepo with the following packages:

```
forms-pwa/
  brands/             # Brand configuration files
  packages/
    config/           # Shared brand config schemas and loader (@forms-pwa/config)
    web/              # SvelteKit frontend application
    api/              # Express backend API
  docker-compose.yml  # Local development infrastructure
  tsconfig.base.json  # Shared TypeScript configuration
```

### `packages/config`

Defines Zod schemas for brand configuration, TypeScript types, and a loader utility that reads brand JSON files at runtime. Used by both the web and API packages.

### `packages/web`

SvelteKit-based frontend that renders forms, handles submissions, and applies brand theming via CSS custom properties derived from the brand config.

### `packages/api`

Express-based REST API that manages forms, responses, users, and authentication. Connects to PostgreSQL via Drizzle ORM.

## Roadmap

- Offline-first form filling with service worker caching
- Native mobile apps via Capacitor (iOS and Android)
- Real-time collaboration on form editing
- Advanced analytics dashboard for form responses
- Webhook integrations for third-party services
