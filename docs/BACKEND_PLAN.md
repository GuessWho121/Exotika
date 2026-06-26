# Backend Architectural Design & Plan - Exotika Creation

This document outlines the complete architectural design, file structure, API endpoints, data validation, and containerization specifications for the backend server of **Exotika Creation**.

---

## 1. Core Architecture & Tech Stack

The backend is designed as a stateless, secure, and type-safe REST API server utilizing the following tech stack:

*   **Runtime Environment**: Node.js (`20.x` or higher)
*   **Web Framework**: Express.js with TypeScript (`tsx` for execution, `tsc` for building)
*   **Database Client / ORM**: Prisma ORM with PostgreSQL
*   **Authentication**: JWT (JSON Web Tokens) stored inside secure, client-hidden `HttpOnly` cookies
*   **Data Validation**: Zod (shared schema validation on client and server)
*   **File Storage Service**: Multi-part uploads using `multer` sent directly to an on-prem **MinIO** container (S3-compatible object storage)
*   **Payment Verification**: Simulated / Mocked payment integrations for on-prem sandbox deployments, with routing for Stripe / Razorpay webhook verifications.

---

## 2. Directory Layout & File Structure

The backend application will reside inside a `/server` subdirectory at the project root:

```
exotika-creation/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema models
│   │   └── seed.ts                # Seed script for initial catalog & admin user
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts              # Prisma Client initialization & connection pool
│   │   │   └── env.ts             # Zod environment variable parsing rules
│   │   ├── controllers/           # Route controller request handlers
│   │   │   ├── authController.ts  # Sign up, Login, Logout, Profile updates
│   │   │   ├── productController.ts # Products CRUD and inventory updates
│   │   │   ├── orderController.ts # Checkouts, Order status logs, payment creation
│   │   │   └── customOrderController.ts # Custom commission request pipeline
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts  # JWT checks and Role authentication (Customer vs Admin)
│   │   │   ├── errorMiddleware.ts # Express centralized global catch-all error handler
│   │   │   ├── uploadMiddleware.ts # Multer file upload stream adapter
│   │   │   └── validateMiddleware.ts # Zod input validation request injector
│   │   ├── routes/                # Express routing registries
│   │   │   ├── authRoutes.ts
│   │   │   ├── productRoutes.ts
│   │   │   ├── orderRoutes.ts
│   │   │   └── customOrderRoutes.ts
│   │   ├── services/              # Integrations
│   │   │   ├── paymentService.ts  # Payment simulation / integration layers
│   │   │   └── storageService.ts  # S3-compatible MinIO file upload adapters
│   │   ├── types/                 # Custom type declarations & index.d.ts overlays
│   │   │   └── index.d.ts
│   │   ├── utils/
│   │   │   └── logger.ts          # Winston logger wrapper for console and rotating logs
│   │   ├── app.ts                 # Express application middleware mounting
│   │   └── server.ts              # HTTP server start and port binding
│   ├── .env.example               # Standard template environment config
│   ├── .gitignore                 # Node / Env files exclusion rules
│   ├── package.json               # Backend dependencies & runtime scripts
│   ├── tsconfig.json              # TypeScript compilation rules
│   └── Dockerfile                 # Multi-stage production container build script
```

---

## 3. Database Schema (`prisma/schema.prisma`)

The PostgreSQL relational database is defined below using Prisma models:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CUSTOMER
  ADMIN
}

enum Category {
  PAINTING
  CRAFT
  TOTE_BAG
  APPAREL
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
}

enum CustomOrderStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model User {
  id           String        @id @default(uuid()) @db.Uuid
  email        String        @unique
  passwordHash String        @map("password_hash")
  name         String
  phone        String?
  address      String?
  city         String?
  zipCode      String?       @map("zip_code")
  role         Role          @default(CUSTOMER)
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  
  orders       Order[]
  favorites    Favorite[]
  customOrders CustomOrder[]

  @@map("users")
}

model Product {
  id          String      @id @default(uuid()) @db.Uuid
  title       String
  price       Decimal     @db.Decimal(12, 2)
  imageUrl    String      @map("image_url")
  description String?
  category    Category
  inStock     Boolean     @default(true) @map("in_stock")
  height      String?
  width       String?
  medium      String?
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")
  
  orderItems  OrderItem[]
  favoritedBy Favorite[]

  @@map("products")
}

model Favorite {
  userId    String   @map("user_id") @db.Uuid
  productId String   @map("product_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@id([userId, productId])
  @@map("favorites")
}

model Order {
  id              String      @id @default(uuid()) @db.Uuid
  userId          String?     @map("user_id") @db.Uuid
  customerName    String      @map("customer_name")
  customerEmail   String      @map("customer_email")
  customerPhone   String      @map("customer_phone")
  shippingAddress String      @map("shipping_address")
  shippingCity    String      @map("shipping_city")
  shippingZipCode String      @map("shipping_zip_code")
  status          OrderStatus @default(PENDING)
  totalAmount     Decimal     @map("total_amount") @db.Decimal(12, 2)
  paymentId       String?     @map("payment_id") // Razorpay Payment/Order ID
  isPaid          Boolean     @default(false) @map("is_paid")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  user            User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  items           OrderItem[]

  @@map("orders")
}

model OrderItem {
  id        String   @id @default(uuid()) @db.Uuid
  orderId   String   @map("order_id") @db.Uuid
  productId String?  @map("product_id") @db.Uuid
  title     String
  price     Decimal  @db.Decimal(12, 2)
  quantity  Int

  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@map("order_items")
}

model CustomOrder {
  id            String                 @id @default(uuid()) @db.Uuid
  userId        String?                @map("user_id") @db.Uuid
  type          String                 // "painting" | "craft"
  description   String
  size          String?
  budget        Decimal                @db.Decimal(12, 2)
  customerName  String                 @map("customer_name")
  customerEmail String                 @map("customer_email")
  customerPhone String                 @map("customer_phone")
  status        CustomOrderStatus      @default(PENDING)
  createdAt     DateTime               @default(now()) @map("created_at")
  updatedAt     DateTime               @updatedAt @map("updated_at")

  user          User?                  @relation(fields: [userId], references: [id], onDelete: SetNull)
  references    CustomOrderReference[]

  @@map("custom_orders")
}

model CustomOrderReference {
  id            String      @id @default(uuid()) @db.Uuid
  customOrderId String      @map("custom_order_id") @db.Uuid
  referenceUrl  String      @map("reference_url")
  createdAt     DateTime    @default(now()) @map("created_at")

  customOrder   CustomOrder @relation(fields: [customOrderId], references: [id], onDelete: Cascade)

  @@map("custom_order_references")
}
```

---

## 4. REST API Endpoint Specifications

All endpoints are prefixed with `/api`.

### 4.1. Authentication & Profile Routes (`/api/auth`)

*   **`POST /auth/register`**
    *   **Description**: Registers a new customer user.
    *   **Body (JSON)**: `name`, `email`, `password`, `phone` (optional), `address` (optional).
    *   **Response**: `201 Created` with User object (excluding password). Sets JWT cookie.
*   **`POST /auth/login`**
    *   **Description**: Authenticates user credentials.
    *   **Body (JSON)**: `email`, `password`.
    *   **Response**: `200 OK` with User details. Sets JWT cookie.
*   **`POST /auth/logout`**
    *   **Description**: Clears JWT token cookie.
    *   **Response**: `200 OK` (clears cookie headers).
*   **`GET /auth/me`**
    *   **Description**: Checks current login session.
    *   **Headers**: Requires active cookie.
    *   **Response**: `200 OK` with User object or `401 Unauthorized`.
*   **`PUT /auth/profile`**
    *   **Description**: Updates user details & default shipping address.
    *   **Headers**: Authenticated.
    *   **Body**: `name`, `phone`, `address`, `city`, `zipCode`.
    *   **Response**: `200 OK` with updated profile.

### 4.2. Product Inventory Routes (`/api/products`)

*   **`GET /products`**
    *   **Description**: Retrieve catalog items with query filtering.
    *   **Queries**: `category` (Filter: PAINTING, CRAFT, etc.), `search` (text matching), `sort` (price_asc, price_desc, date_desc), `page`, `limit`.
    *   **Response**: `200 OK` with list of products and pagination metadata.
*   **`GET /products/:id`**
    *   **Description**: Gets full product specifications.
    *   **Response**: `200 OK` with product details or `404 Not Found`.
*   **`POST /products`** (Admin Only)
    *   **Description**: Add a new product to the catalog.
    *   **Body (JSON)**: `title`, `price`, `imageUrl`, `description`, `category`, `inStock`, `height`, `width`, `medium`.
    *   **Response**: `201 Created`.
*   **`PUT /products/:id`** (Admin Only)
    *   **Description**: Edit a catalog product.
    *   **Body (JSON)**: Partial product fields.
    *   **Response**: `200 OK`.
*   **`DELETE /products/:id`** (Admin Only)
    *   **Description**: Delete a product from inventory.
    *   **Response**: `200 OK` or `204 No Content`.

### 4.3. Favorites System Routes (`/api/favorites`)

*   **`GET /favorites`**
    *   **Description**: Retrieve active customer's wishlisted product models.
    *   **Response**: `200 OK` list of products.
*   **`POST /favorites/:productId`**
    *   **Description**: Add product to user favorites.
    *   **Response**: `201 Created`.
*   **`DELETE /favorites/:productId`**
    *   **Description**: Remove product from user favorites.
    *   **Response**: `200 OK`.

### 4.4. Order Checkout Routes (`/api/orders`)

*   **`POST /orders`**
    *   **Description**: Initialize an order purchase. Creates database record and hooks payment service (Razorpay/Stripe checkout session).
    *   **Body**: `customerName`, `customerEmail`, `customerPhone`, `shippingAddress`, `shippingCity`, `shippingZipCode`, `items` (Array of objects: `{ productId, quantity }`).
    *   **Response**: `201 Created` with created Order object and `paymentParams` (Razorpay Order ID/Stripe URL).
*   **`POST /orders/verify`**
    *   **Description**: Cryptographic check on payment outcome (client redirect trigger verification).
    *   **Body**: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.
    *   **Response**: `200 OK` (updates order as Paid).
*   **`POST /orders/webhook`**
    *   **Description**: Receives payment provider server event to ensure order is marked Paid even if client disconnects during checkout.
    *   **Response**: `200 OK` or signature validation failure response.
*   **`GET /orders`**
    *   **Description**: Get orders history. Admin gets all orders; regular customers get their own orders.
    *   **Response**: `200 OK` list.
*   **`PUT /orders/:id/status`** (Admin Only)
    *   **Description**: Update order shipment status (`PENDING` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED`).
    *   **Body**: `status`.
    *   **Response**: `200 OK`.

### 4.5. Custom Commissions Routes (`/api/custom-orders`)

*   **`POST /custom-orders`**
    *   **Description**: Submits a new custom artwork commission request. Allows uploading multiple reference image files.
    *   **Content-Type**: `multipart/form-data`
    *   **Form fields**: `type` (painting/craft), `description` (20-1000 chars), `size`, `budget` (>= 4000 INR), `customerName`, `customerEmail`, `customerPhone`.
    *   **Files**: `references` (Up to 3 images, processed via Multer and uploaded to the local MinIO storage container).
    *   **Response**: `201 Created` with custom order record.
*   **`GET /custom-orders`**
    *   **Description**: Gets commission log. Users get their requests, Admin gets all requests.
    *   **Response**: `200 OK`.
*   **`PUT /custom-orders/:id/status`** (Admin Only)
    *   **Description**: Transition status (`PENDING` ➔ `IN_PROGRESS` ➔ `COMPLETED` ➔ `CANCELLED`).
    *   **Body**: `status`.
    *   **Response**: `200 OK`.

---

## 5. Security & Middlewares Design

1.  **Authentication Guard (`authMiddleware.ts`)**:
    Parses cookies to read `token`. Decodes JWT using secret. Appends user info to `req.user`. Returns `401 Unauthorized` if validation fails. Adds secondary checker `requireAdmin` that looks at user role.
2.  **Input Schema Validators (`validateMiddleware.ts`)**:
    A higher-order Express function injecting validation matching a Zod schema against query parameters or post request bodies.
3.  **Global Error Handling Handler (`errorMiddleware.ts`)**:
    Wraps standard express throws, handling:
    *   `PrismaClientKnownRequestError` ➔ Translates database crashes or unique constraint violations into readable customer codes.
    *   `ZodError` ➔ Re-packs missing forms error into JSON lists of individual invalid inputs.
    *   General exceptions ➔ Prevents stack traces leakages to client, logging details internally.
4.  **Security Configurations**:
    *   `helmet`: Mounts header protections (XSS, frames restrictions).
    *   `cors`: Locks requests origins strictly to trusted domains.
    *   `express-rate-limit`: Prevents server exhaustion. API endpoints limited to `100` calls per 15 minutes window.

---

## 6. Multi-Container Docker Orchestration

To run the full stack simultaneously on-premise, the standard `docker-compose.yml` config will be upgraded to support isolated service containers for database, backend API, frontend hosting, and object storage:

```yaml
version: '3.8'

services:
  exotika-db:
    image: postgres:16-alpine
    container_name: exotika-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: exotika_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - exotika-network

  exotika-minio:
    image: minio/minio
    container_name: exotika-minio
    restart: unless-stopped
    ports:
      - "9000:9000"   # MinIO S3 API port
      - "9001:9001"   # MinIO Console Web UI port
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    networks:
      - exotika-network

  exotika-backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: exotika-backend
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@exotika-db:5432/exotika_db?schema=public
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=http://localhost:3000
      - S3_ENDPOINT=http://exotika-minio:9000
      - AWS_ACCESS_KEY_ID=${MINIO_ROOT_USER:-minioadmin}
      - AWS_SECRET_ACCESS_KEY=${MINIO_ROOT_PASSWORD:-minioadmin}
      - AWS_S3_BUCKET_NAME=${AWS_S3_BUCKET_NAME:-exotika-bucket}
      - S3_FORCE_PATH_STYLE=true
    depends_on:
      - exotika-db
      - exotika-minio
    networks:
      - exotika-network

  exotika-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: exotika-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - exotika-backend
    networks:
      - exotika-network

networks:
  exotika-network:
    driver: bridge

volumes:
  postgres_data:
  minio_data:
```

### Nginx Routing Proxy Update (`nginx.conf`)
The Nginx configuration serving the static frontend will act as a routing proxy to avoid CORS problems:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Backend API Proxies
    location /api/ {
        proxy_pass http://exotika-backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend routes routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 7. Migration Plan (Steps to Implement)

1.  **Backend Initialization**:
    *   Create the `/server` folder.
    *   Install backend dependencies: Express, Prisma, JWT, multer, Winston, bcryptjs, Zod, and typescript-types.
2.  **Database Migration**:
    *   Connect database with local PostgreSQL environment and execute: `npx prisma migrate dev --name init`.
    *   Run `npx prisma db seed` to insert initial items and create the default administrator user accounts.
3.  **Controllers & Express Routers**:
    *   Program individual handlers and routers according to endpoints specification.
4.  **Frontend API Client Integration**:
    *   Introduce `axios` or similar fetch interface wrapper.
    *   Install `@tanstack/react-query` on the frontend workspace.
    *   Refactor Context scripts (`CartContext`, `AdminContext`, `FavoritesContext`) to dispatch API fetch/mutation requests instead of syncing memory arrays.
5.  **Multi-Container Testing**:
    *   Set up docker-compose file parameters.
    *   Launch local cluster and trigger complete checkout flow, verifying image uploads and session states persistence.
