import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"

// Global Fetch interceptor to rewrite API paths dynamically in production
const originalFetch = window.fetch
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  console.log(`[Fetch Request] URL:`, input, `Init:`, init)
  if (typeof input === "string" && input.startsWith("/api/")) {
    const apiBase = (import.meta as any).env.VITE_API_URL
    if (apiBase) {
      // Remove trailing slash if present to avoid double slash issues
      const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase
      input = `${base}${input}`
    }
  }

  // Force credentials: "include" for backend API calls to share HTTP-Only cookies across subdomains
  if (typeof input === "string" && input.includes("/api/")) {
    init = {
      ...init,
      credentials: init?.credentials || "include"
    }
  }

  return originalFetch(input, init)
}

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
