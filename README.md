# Wishh.ai – Intelligent Note-Taking and Chat Assistant

Wishh.ai is a full-stack Next.js application that combines a chat-oriented user interface with AI-driven insights. It features Supabase authentication, Stripe-powered subscriptions, and a modern editor built on the Plate framework.

You can interact with Wishh.ai directly at [https://wishh.ai](https://wishh.ai).

Built as a privacy-focused productivity assistant, Wishh.ai offers an AI-first interface that combines streaming chat suggestions with note-like "Reveries." These drag-and-drop cards sync in real time via Supabase, letting you organize knowledge into structured, retrievable insights. Customizable agents powered by OpenAI adapt to your workflow.

## Key Features

- **AI Chat Agents** – Integrates with OpenAI APIs to provide context-aware conversation and content suggestions.
- **Rich Text Editing** – Uses Plate and shadcn/ui components for an elegant, customizable editor with support for images, embeds, equations, and more.
- **Supabase Backend** – Handles authentication, database storage, and real-time updates.
- **Stripe Payments** – Subscription management with webhooks and payment method handling.
- **Responsive & Mobile Friendly** – Optimized layouts for desktop, tablet, and mobile devices with dedicated components.
- **PWA Support** – Offline capability and installable on desktop/mobile via `next-pwa`.
- **Rate Limiting** – Express middleware prevents abuse of API endpoints.
- **Neo4j Integration** – (See `src/pages/api/neo4j`) Enables graph-based data relationships for advanced insights.
- **Voice & Media Tools** – Components such as `VoiceListener`, media placeholders, and custom file pickers.

## Running Locally

```bash
npm install
npm run dev
```

Create a `.env.local` with your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
OPENAI_API_KEY=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
GOOGLE_MAPS_API_KEY=...
GOOGLE_MAPS_ID=...
```

Then visit `http://localhost:3000` to start exploring.

## Project Structure

- `src/pages` – Next.js routes (API and UI pages)
- `src/components` – UI components (navigation, editors, dashboards)
- `src/utils` – Supabase helpers, rate limiting, and Stripe utilities
- `public` – Static assets and PWA manifest
- `patches` – Patch-package tweaks for third-party libraries

## Tech Stack

- **Next.js 15**
- **React 18**
- **Tailwind CSS** for styling
- **Supabase** for authentication and data
- **Stripe** for subscription billing
- **OpenAI** for natural-language capabilities
- **Neo4j** for graph data
- **Shadcn UI / Radix** component library
