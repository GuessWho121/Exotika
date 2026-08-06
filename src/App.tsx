import { lazy, Suspense } from "react"
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { CartProvider } from "./contexts/CartContext"
import { AdminProvider, useAdmin } from "./contexts/AdminContext"
import { FavoritesProvider } from "./contexts/FavoritesContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { NotificationContainer } from "./components/NotificationContainer"

const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })))
const CategoryPage = lazy(() => import("./pages/CategoryPage").then(m => ({ default: m.CategoryPage })))
const Cart = lazy(() => import("./pages/Cart").then(m => ({ default: m.Cart })))
const Checkout = lazy(() => import("./pages/Checkout").then(m => ({ default: m.Checkout })))
const OrderSuccess = lazy(() => import("./pages/OrderSuccess").then(m => ({ default: m.OrderSuccess })))
const CustomOrder = lazy(() => import("./pages/CustomOrder").then(m => ({ default: m.CustomOrder })))
const CustomOrderSuccess = lazy(() => import("./pages/CustomOrderSuccess").then(m => ({ default: m.CustomOrderSuccess })))
const Profile = lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })))
const ProductDetail = lazy(() => import("./pages/ProductDetail").then(m => ({ default: m.ProductDetail })))
const Admin = lazy(() => import("./pages/Admin").then(m => ({ default: m.Admin })))
const Login = lazy(() => import("./pages/Login").then(m => ({ default: m.Login })))
const Signup = lazy(() => import("./pages/Signup").then(m => ({ default: m.Signup })))
const SearchPage = lazy(() => import("./pages/SearchPage").then(m => ({ default: m.SearchPage })))

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
                    <Suspense fallback={
                      <div className="flex min-h-[50vh] items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E6C747] border-t-transparent"></div>
                      </div>
                    }>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/paintings" element={
                          <CategoryPage
                            category="PAINTING"
                            title="Beautiful Original Paintings"
                            description="Discover our collection of original paintings that capture the beauty of nature, emotion, and imagination. Each piece is carefully crafted with attention to detail and artistic vision."
                            emptyTitle="No paintings available"
                            emptyDescription="Check back soon for new artwork!"
                          />
                        } />
                        <Route path="/crafts" element={
                          <CategoryPage
                            category="CRAFT"
                            title="Handmade Crafts"
                            description="Explore our unique collection of handcrafted items. From home decor to personal accessories, each craft is created with love and traditional craftsmanship."
                            emptyTitle="No crafts available"
                            emptyDescription="Check back soon for new handmade items!"
                          />
                        } />
                        <Route path="/tote-bags" element={
                          <CategoryPage
                            category="TOTE_BAG"
                            title="Artistic Tote Bags"
                            description="Carry your essentials in style with our original printed and hand-painted tote bags, combining utility with beautiful artistic expressions."
                            emptyTitle="No tote bags available"
                            emptyDescription="Check back soon for new bag designs!"
                          />
                        } />
                        <Route path="/apparel" element={
                          <CategoryPage
                            category="APPAREL"
                            title="Artistic Apparel"
                            description="Wear your love for art. Explore our collection of premium, artistically-designed clothing items made for comfort and style."
                            emptyTitle="No apparel items available"
                            emptyDescription="Check back soon for new apparel collections!"
                          />
                        } />
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
                    </Suspense>
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
