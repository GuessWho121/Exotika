# System Design & Architecture Document - Exotika Creation

## 1. High-Level Architecture Overview
Exotika Creation is structured as a **Single Page Application (SPA)** using **React 18** and **TypeScript** (Vite frontend) communicating with a **Node.js Express + TypeScript** backend server and a **PostgreSQL** database.

For deployment, it runs as a multi-container Docker application:
1. **Development Mode**: Frontend is served by Vite with HMR, and the backend is run in Node.js development mode.
2. **Production Mode**: Frontend static assets are served by an **Nginx** proxy on port 3000, routing all `/api/*` requests dynamically to the **Express API** container on port 8080.

---

## 2. Directory Layout & Modular Structure
The directory layout maps domain concerns to specific folders:

```
exotika-creation/
├── docs/               # System documentation & architectural plan
├── server/             # Express API backend codebase (TypeScript & Prisma)
└── src/
├── assets/             # Raw media assets (logos, placeholder banners)
├── components/         # Reusable global layout & atomic UI elements
│   ├── ui/             # Shadcn-inspired base primitives (dialogs, tables, input, etc.)
│   ├── Header.tsx      # Global responsive navigation menu
│   └── Footer.tsx      # Footer with brand info and links
├── contexts/           # State distribution containers (React Context)
│   ├── CartContext.tsx         # Cart items state and subtotal reductions
│   ├── AdminContext.tsx        # Products CRUD data, Transaction and Custom Order state
│   ├── FavoritesContext.tsx    # Customer wishlist tracking
│   ├── NotificationContext.tsx # Animated notifications toast dispatcher
│   └── ThemeContext.tsx        # Dark/Light mode preferences and local storage sync
├── lib/                # Shared utilities
│   └── utils.ts        # Tailwind merging classes helper (clsx + tailwind-merge)
├── pages/              # Domain-specific viewport components
│   ├── Home.tsx        # Landing view with highlights
│   ├── Paintings.tsx   # Catalog filter for paintings
│   ├── Crafts.tsx      # Catalog filter for crafts
│   ├── ToteBags.tsx    # Catalog filter for bags
│   ├── ProductDetail.tsx # Granular view of selected item
│   ├── Cart.tsx        # Detailed cart summary
│   ├── Checkout.tsx    # Form submission for purchasing
│   ├── CustomOrder.tsx # Multi-step custom request intake
│   ├── Profile.tsx     # Customer details, order log, and wishlist
│   ├── Admin.tsx       # KPI summaries and CRUD action control tables
│   └── Login / Signup  # Authentication gates
├── App.tsx             # Root component hosting providers and routes
└── main.tsx            # DOM mounting and configuration entrypoint
```

---

## 3. Component Hierarchy & Data Flow
Data flows downward from the Context Providers wrapped around the router in `App.tsx`.

### State Hierarchy Diagram (Logical Providers Tree)
```
[NotificationProvider]
  └── [AdminProvider] (Contains global catalog, custom orders, transactions)
        └── [FavoritesProvider] (Tracks liked items)
              └── [CartProvider] (Tracks active cart quantities)
                    └── [Router (HashRouter)]
                          ├── [Header / Navigation]
                          ├── [Active Route Content Page]
                          └── [Footer]
```

### Component Data Lifecycle: Adding to Cart
1. **User interaction**: User clicks "Add to Cart" on a card in [Paintings](file:///c:/Users/aksha/OneDrive/Documents/Projects/Exotika/src/pages/Paintings.tsx) or [ProductDetail](file:///c:/Users/aksha/OneDrive/Documents/Projects/Exotika/src/pages/ProductDetail.tsx).
2. **Context Dispatch**: The component triggers `useCart().dispatch({ type: "ADD_ITEM", payload: product })`.
3. **State Reducer**: `CartContext` reducer computes the updated quantities and total price:
   - If the item already exists in the cart, it increments its `quantity` by 1.
   - If it is new, it appends the item with `quantity: 1`.
4. **Reactive Re-render**: `CartProvider` pushes the updated state down to all components consuming `useCart` (such as the header badge and the cart review page).

---

## 4. Client-Side Routing Design
The application utilizes `HashRouter` from `react-router-dom` rather than `BrowserRouter`.

### Why HashRouter?
*   **Static Server Support**: Nginx and simple static hosts (like GitHub Pages or Netlify) require additional redirection logic to prevent 404 errors when reloading subpaths in modern SPAs. `HashRouter` bypasses this by nesting route coordinates behind the URL hash (`#/`), ensuring the index file is always loaded first.

### Route Map:
*   `/` ➔ Landing Showcase
*   `/paintings` ➔ Painting collection (filtered from global catalog)
*   `/crafts` ➔ Craft collection (filtered from global catalog)
*   `/tote-bags` ➔ Tote Bag collection (filtered from global catalog)
*   `/product/:id` ➔ Dynamic item details page
*   `/cart` ➔ Cart overview
*   `/checkout` ➔ Check-out shipping inputs form
*   `/order-success` ➔ Checkout success page
*   `/custom-order` ➔ Custom commissions form
*   `/custom-order-success` ➔ Custom order success page
*   `/profile` ➔ User profile workspace (orders and wishlist)
*   `/login` / `/signup` ➔ Authentication screen
*   `/admin` ➔ Administrative dashboard panel (requires `state.isAdmin === true`)

---

## 5. Security & Validation Layout
1. **Form & Data Validation**: Server-side and client-side validation are enforced using matching **Zod** schemas. Express routes use custom validation middleware to sanitize inputs.
2. **Session Authentication**: Password hashing is handled via `bcrypt`. Users authenticate using JWTs stored in `HttpOnly` and `Secure` cookies. Route controllers check roles (`CUSTOMER` vs `ADMIN`) before resolving requests.
3. **Media Storage Integration**: Multi-part files uploaded via forms are streamed through a `multer` buffer to the on-prem **MinIO** object storage container. This replaces browser-heavy local Base64 strings.

