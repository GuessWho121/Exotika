import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { CartProvider } from "./contexts/CartContext"
import { AdminProvider, useAdmin } from "./contexts/AdminContext"
import { FavoritesProvider } from "./contexts/FavoritesContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { NotificationContainer } from "./components/NotificationContainer"
import { Home } from "./pages/Home"
import { Paintings } from "./pages/Paintings"
import { Crafts } from "./pages/Crafts"
import { ToteBags } from "./pages/ToteBags"
import { Apparel } from "./pages/Apparel"
import { Cart } from "./pages/Cart"
import { Checkout } from "./pages/Checkout"
import { OrderSuccess } from "./pages/OrderSuccess"
import { CustomOrder } from "./pages/CustomOrder"
import { CustomOrderSuccess } from "./pages/CustomOrderSuccess"
import { Profile } from "./pages/Profile"
import { ProductDetail } from "./pages/ProductDetail"
import { Admin } from "./pages/Admin"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { SearchPage } from "./pages/SearchPage"

import { GoogleOAuthProvider } from "@react-oauth/google"
import { ScrollToTop } from "./components/ScrollToTop"

// 1. Admin Route Guard
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAdmin()

  if (state.loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E6C747] border-t-transparent"></div>
      </div>
    )
  }

  if (!state.user || !state.isAdmin) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// 2. Logged-in Customer Route Guard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAdmin()

  if (state.loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E6C747] border-t-transparent"></div>
      </div>
    )
  }

  if (!state.user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// 3. Guest-only Route Guard (diverts authenticated users away from Login/Signup)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAdmin()

  if (state.loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E6C747] border-t-transparent"></div>
      </div>
    )
  }

  if (state.user) {
    return <Navigate to="/profile" replace />
  }

  return <>{children}</>
}

function App() {
  const googleClientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || ""

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <NotificationProvider>
      <AdminProvider>
        <FavoritesProvider>
          <CartProvider>
            <div className="relative flex min-h-screen flex-col bg-[#FFFBEB]">
              <Router>
                <ScrollToTop />
                <Header />
                <NotificationContainer />
                <main className="flex flex-1 flex-col items-center">
                  <div className="w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-6 md:mt-24">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/paintings" element={<Paintings />} />
                      <Route path="/crafts" element={<Crafts />} />
                      <Route path="/tote-bags" element={<ToteBags />} />
                      <Route path="/apparel" element={<Apparel />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      <Route path="/custom-order" element={<CustomOrder />} />
                      <Route path="/custom-order-success" element={<CustomOrderSuccess />} />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/admin" element={
                        <AdminRoute>
                          <Admin />
                        </AdminRoute>
                      } />
                      <Route path="/login" element={
                        <GuestRoute>
                          <Login />
                        </GuestRoute>
                      } />
                      <Route path="/signup" element={
                        <GuestRoute>
                          <Signup />
                        </GuestRoute>
                      } />
                      <Route path="/search" element={<SearchPage />} />
                    </Routes>
                  </div>
                </main>
                <Footer />
              </Router>
            </div>
          </CartProvider>
        </FavoritesProvider>
      </AdminProvider>
    </NotificationProvider>
    </GoogleOAuthProvider>
  )
}

export default App
