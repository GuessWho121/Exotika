"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Search, User, ShoppingBag, Menu, LogIn, Moon, Sun } from 'lucide-react'
import { useCart } from "../contexts/CartContext"
import { useTheme } from "../contexts/ThemeContext"
import { CartDrawer } from "./CartDrawer"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useCart()
  const { isDarkMode, toggleDarkMode } = useTheme()

  // Mock authentication state - in a real app, this would come from auth context
  const isAuthenticated = false // Change to true to test authenticated state

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/paintings", label: "Paintings" },
    { href: "/crafts", label: "Crafts" },
    { href: "/tote-bags", label: "Tote Bags" },
    { href: "/custom-order", label: "Custom Order" },
  ]

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true
    return href !== "/" && location.pathname.startsWith(href)
  }

  const handleCartClick = () => {
    if (state.itemCount > 0) {
      setIsCartOpen(true)
    } else {
      navigate("/cart")
    }
  }

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate("/checkout")
  }

  const handleUserClick = () => {
    if (isAuthenticated) {
      setIsUserMenuOpen(!isUserMenuOpen)
    } else {
      navigate("/login")
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#FFF5CC] dark:border-gray-700 bg-[#FFFBEB]/80 dark:bg-gray-900/80 px-6 py-4 backdrop-blur-sm md:px-10 transition-colors duration-300">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 text-[#4A3F00] dark:text-white no-underline">
            <svg className="h-10 w-10" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              {/* Outer circle */}
              <circle cx="100" cy="100" r="95" fill="#F4D03F" stroke="#8B4513" strokeWidth="3"/>
              
              {/* Inner circle */}
              <circle cx="100" cy="100" r="85" fill="none" stroke="#8B4513" strokeWidth="2"/>
              
              {/* Top text "HANDMADE WITH LOVE" */}
              <path id="topCircle" d="M 30 100 A 70 70 0 0 1 170 100" fill="none"/>
              <text fontSize="12" fontWeight="bold" fill="#8B4513" fontFamily="serif">
                <textPath href="#topCircle" startOffset="50%" textAnchor="middle">
                  HANDMADE WITH LOVE
                </textPath>
              </text>
              
              {/* Main text "EXOTIKA CREATION" */}
              <text x="100" y="90" fontSize="18" fontWeight="bold" fill="#8B4513" textAnchor="middle" fontFamily="serif">
                EXOTIKA
              </text>
              <text x="100" y="110" fontSize="18" fontWeight="bold" fill="#8B4513" textAnchor="middle" fontFamily="serif">
                CREATION
              </text>
              
              {/* Decorative leaves */}
              <path d="M 40 100 Q 35 95 30 100 Q 35 105 40 100" fill="#8B4513"/>
              <path d="M 45 95 Q 40 90 35 95 Q 40 100 45 95" fill="#8B4513"/>
              <path d="M 45 105 Q 40 110 35 105 Q 40 100 45 105" fill="#8B4513"/>
              
              <path d="M 160 100 Q 165 95 170 100 Q 165 105 160 100" fill="#8B4513"/>
              <path d="M 155 95 Q 160 90 165 95 Q 160 100 155 95" fill="#8B4513"/>
              <path d="M 155 105 Q 160 110 165 105 Q 160 100 155 105" fill="#8B4513"/>
              
              {/* Bottom smile */}
              <path d="M 60 130 Q 100 140 140 130" stroke="#8B4513" strokeWidth="2" fill="none"/>
            </svg>
            <h1 className="text-xl font-bold tracking-tight">Exotika Creation</h1>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`relative text-sm font-medium leading-normal text-[#4A3F00] dark:text-white no-underline transition-colors hover:text-[#FFDE59] ${
                isActive(link.href)
                  ? "after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-[#FFDE59]"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:flex">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C7B00] dark:text-gray-400 transition-colors" />
            <input
              className="h-10 w-48 rounded-lg border-none bg-[#FFFBEB] dark:bg-gray-800 pl-10 pr-4 text-sm font-normal text-[#4A3F00] dark:text-white outline-none transition-all placeholder:text-[#8C7B00] dark:placeholder:text-gray-400 focus:w-64 focus:outline-2 focus:outline-[#FFDE59]"
              placeholder="Search products..."
            />
          </div>

          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFFBEB] dark:bg-gray-800 text-[#4A3F00] dark:text-white transition-all hover:bg-[#FFDE59] dark:hover:bg-[#FFDE59] dark:hover:text-[#4A3F00] md:hidden">
            <Search className="h-5 w-5" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFFBEB] dark:bg-gray-800 text-[#4A3F00] dark:text-white transition-all hover:bg-[#FFDE59] dark:hover:bg-[#FFDE59] dark:hover:text-[#4A3F00]"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={handleUserClick}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFFBEB] dark:bg-gray-800 text-[#4A3F00] dark:text-white transition-all hover:bg-[#FFDE59] dark:hover:bg-[#FFDE59] dark:hover:text-[#4A3F00]"
            >
              {isAuthenticated ? <User className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            </button>

            {/* User Dropdown Menu */}
            {isAuthenticated && isUserMenuOpen && (
              <div className="absolute right-0 top-12 w-48 rounded-lg border border-[#FFF5CC] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                <div className="p-2">
                  <Link
                    to="/profile"
                    className="block rounded-lg px-3 py-2 text-sm text-[#4A3F00] dark:text-white no-underline hover:bg-[#FFFBEB] dark:hover:bg-gray-700"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/profile"
                    className="block rounded-lg px-3 py-2 text-sm text-[#4A3F00] dark:text-white no-underline hover:bg-[#FFFBEB] dark:hover:bg-gray-700"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/profile"
                    className="block rounded-lg px-3 py-2 text-sm text-[#4A3F00] dark:text-white no-underline hover:bg-[#FFFBEB] dark:hover:bg-gray-700"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Favorites
                  </Link>
                  <hr className="my-2 border-[#FFF5CC] dark:border-gray-700" />
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      // Handle logout
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleCartClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFFBEB] dark:bg-gray-800 text-[#4A3F00] dark:text-white transition-all hover:bg-[#FFDE59] dark:hover:bg-[#FFDE59] dark:hover:text-[#4A3F00]"
          >
            <ShoppingBag className="h-5 w-5" />
            {state.itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFDE59] text-xs font-bold text-[#4A3F00]">
                {state.itemCount}
              </span>
            )}
          </button>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFFBEB] dark:bg-gray-800 text-[#4A3F00] dark:text-white transition-all hover:bg-[#FFDE59] dark:hover:bg-[#FFDE59] dark:hover:text-[#4A3F00] md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute left-0 right-0 top-full bg-[#FFFBEB] dark:bg-gray-900 border-b border-[#FFF5CC] dark:border-gray-700 md:hidden transition-colors duration-300">
            <nav className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium text-[#4A3F00] dark:text-white no-underline py-2 px-3 rounded-lg transition-colors hover:bg-[#FFF5CC] dark:hover:bg-gray-800 ${
                    isActive(link.href) ? "bg-[#FFF5CC] dark:bg-gray-800 text-[#FFDE59]" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-[#4A3F00] dark:text-white no-underline py-2 px-3 rounded-lg transition-colors hover:bg-[#FFF5CC] dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-medium text-[#4A3F00] dark:text-white no-underline py-2 px-3 rounded-lg transition-colors hover:bg-[#FFF5CC] dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <Link
                  to="/profile"
                  className="text-sm font-medium text-[#4A3F00] dark:text-white no-underline py-2 px-3 rounded-lg transition-colors hover:bg-[#FFF5CC] dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={handleCheckout} />
    </>
  )
}
