# Product Requirements Document (PRD) - Exotika Creation

## 1. Executive Summary & Product Vision
**Exotika Creation** is an interactive, premium e-commerce web platform designed to showcase and sell unique handcrafted artworks, beautiful artisanal crafts, and custom-designed tote bags. 
Beyond standard retail purchase flows, Exotika features a **Custom Order Request pipeline** that connects clients directly with creators for personalized canvas paintings and crafts. The platform contains a robust checkout module, user profile tracking, and a built-in administrative management dashboard.

---

## 2. User Roles & Personas
The application defines three main access roles:
1. **Anonymous Visitor**: Can browse products, view details, manage a persistent shopping cart, add items to favorites, and read about Exotika.
2. **Registered Customer**: Can login, sign up, submit custom orders with reference images, track their order history, maintain favorites, and manage shipping addresses.
3. **Administrator**: Can toggle admin mode, view high-level platform metrics (total earnings, transactions count, pending custom requests), add/edit/delete products in the catalog, and update shipping or custom order statuses.

---

## 3. Core Functional Requirements

### 3.1. Product Discovery & Details
*   **Grid Catalog View**: Categorized navigation for Paintings, Crafts, and Tote Bags.
*   **Product Detail Page**: Displays high-quality images, description, pricing (in ₹ INR), stock status, and category-specific parameters (e.g., dimensions and medium for canvas paintings).
*   **Favorites & Wishlist**: Toggleable favorites that persist in context and link to the user profile.

### 3.2. Shopping Cart & Checkout
*   **Active Cart Sidebar/Page**: Allows modifying product quantities, deleting items, and dynamically updates order subtotals.
*   **Checkout Flow**: Form requiring customer details:
    *   **Name**: Minimum 2 characters.
    *   **Email**: Validated email format.
    *   **Phone**: Validated 10-digit Indian mobile number (e.g., starting with 6-9).
    *   **Shipping Address, City, Zip Code**: Validated text fields.
*   **Order Confirmation**: Generates a simulated transaction ID, clears active cart, and displays success notifications.

### 3.3. Custom Order Request System
*   **Interactive Custom Form**: Clients can request tailored commissions.
    *   **Category Selection**: Painting or Craft.
    *   **Vision Description**: Multi-line textbox requiring 20 to 1000 characters.
    *   **Dimensions/Size**: Desired canvas or object dimensions.
    *   **Budget range**: Numeric input between ₹4,000 and ₹5,00,000 INR.
    *   **Customer Details**: Full contact information (Name, Email, Phone).
    *   **Visual Reference Upload**: Up to 3 reference images, converted to base64 for mockup previews.
*   **Order Logging**: Submits requests directly to the Administrator dashboard.

### 3.4. User Profiles & Authentication
*   **Auth Gates**: Mocked SignUp and Login views with validation.
*   **User Dashboard**:
    *   Profile Settings (Updating personal shipping details).
    *   **Favorites List**: Instant traversal back to liked products.
    *   **Order History**: Tracking past checkout items and custom requests.

### 3.5. Administrative Portal
*   **KPI Statistics Cards**: Displays total sales revenue, transactions count, active orders, and pending custom commission requests.
*   **Catalog CRUD Manager**:
    *   Add new items (with titles, prices, images, descriptions, category attributes).
    *   Edit existing items' stocks, prices, or descriptions.
    *   Delete products from database state.
*   **Transaction Tracker**: Table displaying all checkout events, permitting status overrides: `Pending` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`.
*   **Custom Request Manager**: Displays commission descriptions, requested budget, and base64 reference images. Administrators can adjust status: `Pending` ➔ `In-Progress` ➔ `Completed` ➔ `Cancelled`.

---

## 4. Non-Functional Requirements
*   **Responsive Layout**: Seamless transition across Desktop, Tablet, and Mobile viewport break-points using Tailwind CSS.
*   **UX Micro-animations**: Soft hover transformations on product cards, animated notification toasts, and skeleton/spinner loading feedback.
*   **Color Palette & Theme**: HSL-curated warm tones (defaulting to warm sand/cream background `#FFFBEB` to reflect artisanal craft aesthetics), supporting light/dark theme switches.
*   **Offline Mock Stability**: Memory-managed mock data schemas allowing full client-side demo walkthroughs without requiring database backends during stage presentations.
