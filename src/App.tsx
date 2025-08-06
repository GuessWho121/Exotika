import { HashRouter as Router, Routes, Route } from "react-router-dom"
import { CartProvider } from "./contexts/CartContext"
import { AdminProvider } from "./contexts/AdminContext"
import { FavoritesProvider } from "./contexts/FavoritesContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { NotificationContainer } from "./components/NotificationContainer"
import { Home } from "./pages/Home"
import { Paintings } from "./pages/Paintings"
import { Crafts } from "./pages/Crafts"
import { ToteBags } from "./pages/ToteBags"
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

function App() {
  return (
    <NotificationProvider>
      <AdminProvider>
        <FavoritesProvider>
          <CartProvider>
            <div className="relative flex min-h-screen flex-col bg-[#FFFBEB]">
              <Router>
                <Header />
                <NotificationContainer />
                <main className="flex flex-1 flex-col items-center">
                  <div className="w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/paintings" element={<Paintings />} />
                      <Route path="/crafts" element={<Crafts />} />
                      <Route path="/tote-bags" element={<ToteBags />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      <Route path="/custom-order" element={<CustomOrder />} />
                      <Route path="/custom-order-success" element={<CustomOrderSuccess />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
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
  )
}

export default App
