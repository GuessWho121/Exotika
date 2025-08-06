# Exotika Creation

Welcome to Exotika Creation, an e-commerce platform showcasing unique handcrafted artworks, beautiful crafts, and stylish tote bags. This application allows users to browse products, add items to their cart, place custom orders, and manage their profiles. Admins have access to a dedicated panel for managing products, orders, and custom requests.

## ✨ Features

*   **Product Catalog**: Browse a wide range of paintings, crafts, and tote bags.
*   **Product Details**: View detailed information about each product, including images, descriptions, and pricing.
*   **Shopping Cart**: Add, update, and remove items from your cart.
*   **Checkout Process**: A streamlined checkout flow for purchasing items.
*   **Custom Order Requests**: Submit requests for personalized artworks or crafts.
*   **User Profiles**: Manage personal information, view order history, and favorite items.
*   **Admin Panel**:
    *   Dashboard with key statistics.
    *   Product management (add, edit, delete products).
    *   Order and transaction tracking.
    *   Custom order request management.
*   **Responsive Design**: Optimized for various screen sizes (desktop, tablet, mobile).
*   **Local Storage Persistence**: Demo data for products, transactions, and custom orders is persisted in local storage for demonstration purposes.

## 🚀 Technologies Used

*   **Frontend**: React, Vite
*   **Styling**: Tailwind CSS, Shadcn/ui
*   **Routing**: React Router DOM
*   **State Management**: React's `useReducer` and `useContext` for global state (Cart, Admin, Favorites)
*   **Containerization**: Docker, Docker Compose
*   **Build Tool**: Vite
*   **Linting**: ESLint, TypeScript ESLint

## 📦 Getting Started

You can run this project either directly on your machine (non-Dockerized) or using Docker.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: Version 20.x or higher.
*   **npm** or **Yarn**: Node.js package manager.
*   **Git**: For cloning the repository.
*   **Docker & Docker Compose** (if using the Dockerized version)

### 💻 Non-Dockerized Setup

Follow these steps to get the project up and running without Docker:

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/your-username/exotika-creation.git
    cd exotika-creation
    \`\`\`
2.  **Install dependencies:**
    \`\`\`bash
    npm install
    # or yarn install
    # or pnpm install
    \`\`\`
3.  **Run the development server:**
    \`\`\`bash
    npm run dev
    \`\`\`
    The application will be accessible at `http://localhost:5173`.

4.  **Build for production (optional):**
    \`\`\`bash
    npm run build
    \`\`\`
    This will create a `dist` directory with the production-ready build.

### 🐳 Dockerized Setup

Follow these steps to run the project using Docker:

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/your-username/exotika-creation.git
    cd exotika-creation
    \`\`\`
2.  **For Development (with hot-reloading):**
    Use the `docker-compose.dev.yml` file. This sets up a development environment with volume mounts for live code changes.
    \`\`\`bash
    docker-compose -f docker-compose.dev.yml up --build
    \`\`\`
    The development server will be available at `http://localhost:5173`. Changes to your source code will automatically trigger a rebuild and refresh in the browser.

3.  **For Production (optimized build):**
    Use the `docker-compose.yml` file. This builds an optimized production image and serves it via Nginx.
    \`\`\`bash
    docker-compose up --build -d
    \`\`\`
    The production application will be accessible at `http://localhost:3000`.

    To stop the production containers:
    \`\`\`bash
    docker-compose down
    \`\`\`

### ⚙️ Available Scripts

In the project directory, you can run:

*   **`npm run dev`**: Runs the app in development mode.
*   **`npm run build`**: Builds the app for production to the `dist` folder.
*   **`npm run start`**: (Note: This script is typically for Next.js. For this Vite project, you'd serve the `dist` folder with a static server like `serve` or Nginx after building.)
*   **`npm run lint`**: Lints the project files for code quality and style issues.

## 📂 Project Structure

\`\`\`
.
├── public/
├── src/
│   ├── assets/
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React Contexts for global state management
│   ├── lib/                # Utility functions (e.g., cn for Tailwind)
│   ├── pages/              # Main application pages
│   ├── App.tsx             # Main application component and router setup
│   ├── main.tsx            # Entry point for React app
│   └── index.css           # Global styles
├── Dockerfile              # Dockerfile for production build
├── Dockerfile.dev          # Dockerfile for development environment
├── docker-compose.yml      # Docker Compose for production deployment
├── docker-compose.dev.yml  # Docker Compose for development environment
├── nginx.conf              # Nginx configuration for production server
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration (for Tailwind CSS)
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── .gitignore              # Files and directories to ignore in Git
└── README.md               # This file
\`\`\`

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
