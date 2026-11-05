import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, LayoutDashboard, Instagram, Facebook, Mail, Menu, X } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAdmin } from '../contexts/AdminContext'
import { Logo } from './Logo'

interface StaggeredMenuProps {
  onCartClick?: () => void
  isFixed?: boolean
  className?: string
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  onCartClick,
  isFixed = false,
  className = ''
}) => {
  const [open, setOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { state: cartState } = useCart()
  const { state: adminState, logoutUser } = useAdmin()
  const isAuthenticated = !!adminState.user
  const navigate = useNavigate()
  const location = useLocation()

  const baseItems = [
    { label: 'Home', link: '/' },
    { label: 'Paintings', link: '/paintings' },
    { label: 'Crafts', link: '/crafts' },
    { label: 'Tote Bags', link: '/tote-bags' },
    { label: 'Apparel', link: '/apparel' },
    { label: 'Custom Order', link: '/custom-order' },
  ]

  const dynamicItems = [...baseItems]
  if (!isAuthenticated) {
    dynamicItems.push(
      { label: 'Login', link: '/login' },
      { label: 'Sign Up', link: '/signup' }
    )
  } else {
    dynamicItems.push(
      { label: 'My Profile', link: '/profile?tab=profile' },
      { label: 'My Orders', link: '/profile?tab=orders' },
      { label: 'Favorites', link: '/profile?tab=favorites' }
    )
  }

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
    setIsSearchOpen(false)
  }, [location.pathname])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setOpen(false)
    }
  }

  const handleCart = () => {
    if (onCartClick) {
      onCartClick()
    } else {
      navigate('/cart')
    }
  }

  const isActive = (href: string) => {
    if (href === '/' && location.pathname === '/') return true
    return href !== '/' && location.pathname.startsWith(href)
  }

  return (
    <div className={`w-full ${isFixed ? 'sticky top-0 z-50' : ''} ${className}`}>
      {/* Mobile Top Header */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-[#FFF5CC] bg-[#FFFBEB]/95 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5 text-[#4A3F00] no-underline" onClick={() => setOpen(false)}>
          <Logo size={30} />
          <span className="font-bold text-base tracking-tight text-[#4A3F00]">Exotika Creation</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              isSearchOpen ? 'bg-[#FFDE59] text-[#4A3F00]' : 'bg-[#FFFBEB] text-[#4A3F00] border border-[#FFF5CC]'
            }`}
            aria-label="Toggle search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Admin Dashboard */}
          {adminState.isAdmin && (
            <Link
              to="/admin"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFBEB] border border-[#FFF5CC] text-[#4A3F00]"
              onClick={() => setOpen(false)}
              aria-label="Admin Dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          )}

          {/* Shopping Cart */}
          <button
            type="button"
            onClick={handleCart}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFBEB] border border-[#FFF5CC] text-[#4A3F00]"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartState.itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFDE59] text-[10px] font-bold text-[#4A3F00]">
                {cartState.itemCount}
              </span>
            )}
          </button>

          {/* Menu Drawer Toggle */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFDE59] text-[#4A3F00] transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Collapsible Search Input */}
      {isSearchOpen && (
        <div className="w-full px-5 py-2.5 border-b border-[#FFF5CC] bg-[#FFFBEB] animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7B00]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-full border border-[#E6C747] bg-white pl-9 pr-4 text-xs text-[#4A3F00] outline-none focus:ring-2 focus:ring-[#FFDE59]"
              placeholder="Search products..."
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-72 sm:w-80 bg-[#FFFBEB] z-50 shadow-2xl flex flex-col justify-between p-6 border-l border-[#FFF5CC] transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#FFF5CC]">
            <span className="font-bold text-base text-[#4A3F00]">Menu</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#FFF5CC] text-[#4A3F00]"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <ul className="mt-4 space-y-1 list-none p-0 m-0">
            {dynamicItems.map((item) => {
              const active = isActive(item.link)
              return (
                <li key={item.link}>
                  <Link
                    to={item.link}
                    onClick={() => setOpen(false)}
                    className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors no-underline ${
                      active
                        ? 'bg-[#FFDE59] text-[#4A3F00]'
                        : 'text-[#4A3F00] hover:bg-[#FFF5CC]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}

            {isAuthenticated && (
              <li className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    setOpen(false)
                    await logoutUser()
                    navigate('/')
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Social Links Footer */}
        <div className="pt-6 border-t border-[#FFF5CC]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7B00] mb-3">Connect With Us</h4>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/exotikacreations?utm_source=qr&igsh=ZHg4bXl5aW9lYm9q"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF5CC] text-[#4A3F00] hover:bg-[#FFDE59] transition-colors"
              title="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/share/1NoVoTJHBa/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF5CC] text-[#4A3F00] hover:bg-[#FFDE59] transition-colors"
              title="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/message/3NXIL5VDTOIWL1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF5CC] text-[#4A3F00] hover:bg-[#FFDE59] transition-colors"
              title="WhatsApp"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.45L0 24zm12.01-21.867c-5.467 0-9.913 4.446-9.917 9.917-.002 1.902.51 3.75 1.482 5.355l.23.38-1.002 3.661 3.743-.982.37.219c1.533.91 3.283 1.392 5.083 1.393h.005c5.462 0 9.91-4.444 9.914-9.917.002-2.651-1.032-5.144-2.903-7.017-1.872-1.873-4.367-2.909-7.012-2.909zm5.44 13.081c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.174.2-.298.3-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </a>
            <a
              href="mailto:exotikacreation@gmail.com"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF5CC] text-[#4A3F00] hover:bg-[#FFDE59] transition-colors"
              title="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default StaggeredMenu
