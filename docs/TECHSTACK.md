# Technology Stack Document - Exotika Creation

This document outlines the software components, runtime systems, build tools, package dependencies, and container configurations that form the core tech stack of Exotika Creation.

---

## 1. Core Frameworks & Runtime

| Component | Technology | Version | Description / Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^18.2.0` | Declarative, component-based user interface framework. |
| **Language** | TypeScript | `^5.2.2` | Typed superset of JavaScript, providing compiled checks and auto-complete in development. |
| **Build System / Bundler** | Vite | `^5.0.0` | Ultra-fast build tool leveraging native ES Modules (ESM) for rapid hot reloads during development. |
| **Routing** | React Router DOM | `^6.20.1` | Declarative client-side route handling (using `HashRouter` for static deployment compatibility). |
| **Application Runtime** | Node.js | `20.x+` | JavaScript engine environment powering the build tools and local dev environments. |

---

## 2. UI, Styling & Visualizations

| Package | Version | Description / Purpose |
| :--- | :--- | :--- |
| **CSS Utility Engine** | Tailwind CSS | `^3.3.6` | Utility-first CSS library for styling responsive layouts directly in React components. |
| **Component Primitives** | Radix UI | *Various* | WAI-ARIA compliant, unstyled accessible UI primitives used for modal dialogues, tabs, select, scroll areas, and dropdowns. |
| **Component Library** | shadcn/ui | `Latest` | Reusable Radix UI + Tailwind CSS styled UI components (Button, Dialog, Input, Select, Table, Card, Tabs, Accordion) integrated via local CLI setup. |
| **Style Concatenation** | clsx & tailwind-merge | `^2.1.1` & `^2.5.5` | Utilities to merge Tailwind classes dynamically, preventing utility conflicts (wrapped in helper [utils.ts](file:///c:/Users/aksha/OneDrive/Documents/Projects/Exotika/src/lib/utils.ts)). |
| **Vector Icons** | Lucide React | `^0.294.0` | Open-source pixel-perfect icon pack for visual navigation and buttons. |
| **Typography** | Geist Fonts | `^1.3.1` | Premium typography family by Vercel for clean, legible product text and tables. |
| **Visual Charts** | Recharts | `2.15.0` | Composited D3-based charting library used on the Admin panel to display sales, transactions, and commission analytics. |

---

## 3. Form Handling & Data Validation

| Package | Version | Description / Purpose |
| :--- | :--- | :--- |
| **Form Control** | React Hook Form | `^7.54.1` | Efficient, lightweight hook-based library minimizing re-renders on inputs. |
| **Schema Validation** | Zod | `^3.24.1` | Schema declaration and verification library for checking registration, profile, and custom order objects. |
| **Form Adapters** | `@hookform/resolvers` | `^3.9.1` | Bridge resolver mapping Zod schemas into React Hook Form controls. |

---

## 4. Environment & Devops Infrastructure

### 4.1. Development Container (Docker & Compose)
*   **Base Image**: `node:20-alpine` (configured in [Dockerfile.dev](file:///c:/Users/aksha/OneDrive/Documents/Projects/Exotika/Dockerfile.dev)).
*   **Hot Reload Mechanism**: Maps local workspace directory to `/app` inside the container using Docker Volumes, exposing port `5173`.
*   **Run command**: `npm run dev`

### 4.2. Production Server
*   **Multi-stage Dockerfile**:
    1.  **Build Stage**: Installs dependencies and executes `npm run build` using Node.js to output static files into `dist/`.
    2.  **Run Stage**: Pulls an `nginx:alpine` image, copies the `dist/` build output into Nginx's default HTML path, and uses a custom [nginx.conf](file:///c:/Users/aksha/OneDrive/Documents/Projects/Exotika/nginx.conf) to serve the site on port `3000`.

---

## 5. Development & Code Quality Tooling

*   **Linter**: ESLint `^8.53.0` with `@typescript-eslint/parser` and rules enforcing React hook patterns and preventing standard code smells.
*   **Transpilation target**: ES Next modules targeting modern browsers capable of running ESM.
*   **PostCSS**: `autoprefixer` `^10.4.16` automatically appends vendor prefixes (e.g. `-webkit-`, `-moz-`) during Tailwind builds to maintain cross-browser styling compatibility.
