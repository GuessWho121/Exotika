"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Search, User, ShoppingBag, LogIn, LayoutDashboard } from 'lucide-react'
import { useCart } from "../contexts/CartContext"
import { CartDrawer } from "./CartDrawer"
import { useAdmin } from "../contexts/AdminContext"
import { StaggeredMenu } from "./StaggeredMenu"
import PillNav from "./PillNav"
import { Logo } from "./Logo"

export function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  const location = useLocation()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isUserMenuOpen])
  const navigate = useNavigate()
  const { state } = useCart()
  const { state: adminState, logoutUser } = useAdmin()
  const isAuthenticated = !!adminState.user

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/paintings", label: "Paintings" },
    { href: "/crafts", label: "Crafts" },
    { href: "/tote-bags", label: "Tote Bags" },
    { href: "/apparel", label: "Apparel" },
    { href: "/custom-order", label: "Custom Order" },
  ]


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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <>
      {/* 1. Desktop Header View (React Bits PillNav) */}
      <div className="hidden lg:block">
        <PillNav
          logo={<Logo size={36} />}
          logoAlt="Exotika Creation"
          items={navLinks.map(link => ({ label: link.label, href: link.href }))}
          activeHref={location.pathname}
        >
          <div className="flex items-center gap-3 ml-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7B00]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-40 rounded-full border border-[#E6C747] bg-white pl-9 pr-4 text-xs font-semibold text-[#4A3F00] outline-none transition-all placeholder:text-[#8C7B00] focus:w-52 focus:outline-2 focus:outline-[#FFDE59]"
                placeholder="Search..."
              />
            </form>

            {/* Admin Panel Button (Conditional) */}
            {adminState.isAdmin && (
              <Link 
                to="/admin"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFBEB] border border-[#FFF5CC] text-[#4A3F00] transition-all hover:bg-[#FFDE59]"
                title="Admin Panel"
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
              </Link>
            )}

            {/* User / Authentication Button */}
            {!isAuthenticated ? (
              <button 
                onClick={handleUserClick}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFDE59] hover:bg-[#e6c747] text-[#4A3F00] font-bold text-xs transition-all shadow-sm active:scale-[0.98]"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </button>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button 
                   onClick={handleUserClick}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFBEB] border border-[#FFF5CC] text-[#4A3F00] transition-all hover:bg-[#FFDE59]"
                >
                  <User className="h-4.5 w-4.5" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-11 w-48 rounded-xl border border-[#FFF5CC] bg-white shadow-lg z-50">
                    <div className="p-2">
                      <Link
                        to="/profile?tab=profile"
                        className="block rounded-lg px-3 py-2 text-xs font-bold text-[#4A3F00] no-underline hover:bg-[#FFFBEB]"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/profile?tab=orders"
                        className="block rounded-lg px-3 py-2 text-xs font-bold text-[#4A3F00] no-underline hover:bg-[#FFFBEB]"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/profile?tab=favorites"
                        className="block rounded-lg px-3 py-2 text-xs font-bold text-[#4A3F00] no-underline hover:bg-[#FFFBEB]"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Favorites
                      </Link>
                      <hr className="my-1.5 border-[#FFF5CC]" />
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false)
                          await logoutUser()
                          navigate("/")
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={handleCartClick}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFBEB] border border-[#FFF5CC] text-[#4A3F00] transition-all hover:bg-[#FFDE59]"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {state.itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFDE59] text-[10px] font-bold text-[#4A3F00]">
                  {state.itemCount}
                </span>
              )}
            </button>
          </div>
        </PillNav>
      </div>

      {/* 2. Mobile Header View (React Bits Staggered Menu - sticky on small viewports) */}
      <div className="lg:hidden sticky top-0 z-50">
        <StaggeredMenu onCartClick={handleCartClick} isFixed={true} />
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={handleCheckout} />
    </>
  )
}
