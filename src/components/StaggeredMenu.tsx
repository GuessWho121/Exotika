import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, LayoutDashboard, Instagram, Facebook, Globe, Mail } from 'lucide-react'
import { useCart } from "../contexts/CartContext"
import { useAdmin } from "../contexts/AdminContext"
import './StaggeredMenu.css'
import { Logo } from "./Logo"

export interface StaggeredMenuItem {
  label: string
  ariaLabel?: string
  link: string
}

export interface StaggeredMenuSocialItem {
  label: string
  link: string
}

interface StaggeredMenuProps {
  onCartClick: () => void
  position?: 'left' | 'right'
  colors?: string[]
  socialItems?: StaggeredMenuSocialItem[]
  displaySocials?: boolean
  displayItemNumbering?: boolean
  className?: string
  menuButtonColor?: string
  openMenuButtonColor?: string
  accentColor?: string
  changeMenuColorOnOpen?: boolean
  isFixed?: boolean
  closeOnClickAway?: boolean
  onMenuOpen?: () => void
  onMenuClose?: () => void
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = 'right',
  colors = ['#FFF5CC', '#FFDE59', '#F4D03F'], // Warm yellow tones matching Exotika theme
  socialItems = [
    { label: 'Instagram', link: 'https://www.instagram.com/exotikacreations?utm_source=qr&igsh=ZHg4bXl5aW9lYm9q' },
    { label: 'Facebook', link: 'https://www.facebook.com/share/1NoVoTJHBa/' },
    { label: 'WhatsApp', link: 'https://wa.me/message/3NXIL5VDTOIWL1' },
    { label: 'Email', link: 'mailto:exotikacreation@gmail.com' }
  ],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  menuButtonColor = '#4A3F00',
  openMenuButtonColor = '#4A3F00',
  accentColor = '#8B4513',
  changeMenuColorOnOpen = true,
  isFixed = false,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose
}) => {
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const preLayersRef = useRef<HTMLDivElement>(null)
  const preLayerElsRef = useRef<HTMLDivElement[]>([])
  const plusHRef = useRef<HTMLSpanElement>(null)
  const plusVRef = useRef<HTMLSpanElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)
  const textInnerRef = useRef<HTMLSpanElement>(null)
  const textWrapRef = useRef<HTMLSpanElement>(null)
  const [textLines, setTextLines] = useState(['Menu', 'Close'])

  const openTlRef = useRef<gsap.core.Timeline | null>(null)
  const closeTweenRef = useRef<gsap.core.Tween | null>(null)
  const spinTweenRef = useRef<gsap.core.Tween | null>(null)
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null)
  const colorTweenRef = useRef<gsap.core.Tween | null>(null)
  const toggleBtnRef = useRef<HTMLButtonElement>(null)
  const busyRef = useRef(false)
  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null)

  // Exotika eCommerce hooks
  const { state: cartState } = useCart()
  const { state: adminState, logoutUser } = useAdmin()
  const isAuthenticated = !!adminState.user
  const navigate = useNavigate()
  const location = useLocation()

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Navigation Links
  const baseItems = [
    { label: "Home", link: "/" },
    { label: "Paintings", link: "/paintings" },
    { label: "Crafts", link: "/crafts" },
    { label: "Tote Bags", link: "/tote-bags" },
    { label: "Apparel", link: "/apparel" },
    { label: "Custom Order", link: "/custom-order" },
  ]

  const dynamicItems = [...baseItems]
  if (!isAuthenticated) {
    dynamicItems.push(
      { label: "Login", link: "/login" },
      { label: "Sign Up", link: "/signup" }
    )
  } else {
    dynamicItems.push(
      { label: "My Profile", link: "/profile?tab=profile" },
      { label: "My Orders", link: "/profile?tab=orders" },
      { label: "Favorites", link: "/profile?tab=favorites" }
    )
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
    }
  }

  const getSocialIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-6 w-6" />
      case 'facebook':
        return <Facebook className="h-6 w-6" />
      case 'email':
      case 'mail':
        return <Mail className="h-6 w-6" />
      case 'whatsapp':
        return (
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.45L0 24zm12.01-21.867c-5.467 0-9.913 4.446-9.917 9.917-.002 1.902.51 3.75 1.482 5.355l.23.38-1.002 3.661 3.743-.982.37.219c1.533.91 3.283 1.392 5.083 1.393h.005c5.462 0 9.91-4.444 9.914-9.917.002-2.651-1.032-5.144-2.903-7.017-1.872-1.873-4.367-2.909-7.012-2.909zm5.44 13.081c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.174.2-.298.3-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          </svg>
        )
      default:
        return <Globe className="h-6 w-6" />
    }
  }

  const onCartClick = () => {
    if (cartState.itemCount > 0) {
      // Direct navigation to cart page in mobile version is cleaner
      navigate("/cart")
    } else {
      navigate("/cart")
    }
  }

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true
    return href !== "/" && location.pathname.startsWith(href)
  }

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current
      const preContainer = preLayersRef.current
      const plusH = plusHRef.current
      const plusV = plusVRef.current
      const icon = iconRef.current
      const textInner = textInnerRef.current
      if (!panel || !plusH || !plusV || !icon || !textInner) return

      let preLayers: HTMLDivElement[] = []
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'))
      }
      preLayerElsRef.current = preLayers

      gsap.set([panel, ...preLayers], { xPercent: 100, opacity: 1 })
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 })
      }
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 })
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 })
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' })
      gsap.set(textInner, { yPercent: 0 })
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor })
    })
    return () => ctx.revert()
  }, [menuButtonColor])

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return null

    openTlRef.current?.kill()
    if (closeTweenRef.current) {
      closeTweenRef.current.kill()
      closeTweenRef.current = null
    }
    itemEntranceTweenRef.current?.kill()

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'))
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'))
    const socialTitle = panel.querySelector('.sm-socials-title')
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'))

    const layerStates = layers.map(el => ({ el, start: 100 }))
    const panelStart = 100

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10 })
    }
    if (numberEls.length) {
      gsap.set(numberEls, { '--sm-num-opacity': 0 })
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 })
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 })
    }

    const tl = gsap.timeline({ paused: true })

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07)
    })
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0)
    const panelDuration = 0.65
    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    )

    if (itemEls.length) {
      const itemsStartRatio = 0.15
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' }
        },
        itemsStart
      )
      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: 'power2.out',
            '--sm-num-opacity': 1,
            stagger: { each: 0.08, from: 'start' }
          },
          itemsStart + 0.1
        )
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4
      if (socialTitle) {
        tl.to(
          socialTitle,
          {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
          },
          socialsStart
        )
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' })
            }
          },
          socialsStart + 0.04
        )
      }
    }

    openTlRef.current = tl
    return tl
  }, [])

  const playOpen = useCallback(() => {
    if (busyRef.current) return
    busyRef.current = true
    const tl = buildOpenTimeline()
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false
      })
      tl.play(0)
    } else {
      busyRef.current = false
    }
  }, [buildOpenTimeline])

  const playClose = useCallback(() => {
    openTlRef.current?.kill()
    openTlRef.current = null
    itemEntranceTweenRef.current?.kill()

    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return

    const all = [...layers, panel]
    closeTweenRef.current?.kill()
    closeTweenRef.current = gsap.to(all, {
      xPercent: 100,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'))
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 10 })
        }
        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'))
        if (numberEls.length) {
          gsap.set(numberEls, { '--sm-num-opacity': 0 })
        }
        const socialTitle = panel.querySelector('.sm-socials-title')
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'))
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 })
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 })
        busyRef.current = false
      }
    })
  }, [])

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current
    if (!icon) return
    spinTweenRef.current?.kill()
    if (opening) {
      spinTweenRef.current = gsap.to(icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' })
    } else {
      spinTweenRef.current = gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' })
    }
  }, [])

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current
      if (!btn) return
      colorTweenRef.current?.kill()
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.18,
          duration: 0.3,
          ease: 'power2.out'
        })
      } else {
        gsap.set(btn, { color: menuButtonColor })
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  )

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor
        gsap.set(toggleBtnRef.current, { color: targetColor })
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor })
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor])

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current
    if (!inner) return
    textCycleAnimRef.current?.kill()

    const currentLabel = opening ? 'Menu' : 'Close'
    const targetLabel = opening ? 'Close' : 'Menu'
    const cycles = 3
    const seq = [currentLabel]
    let last = currentLabel
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu'
      seq.push(last)
    }
    if (last !== targetLabel) seq.push(targetLabel)
    seq.push(targetLabel)
    setTextLines(seq)

    gsap.set(inner, { yPercent: 0 })
    const lineCount = seq.length
    const finalShift = ((lineCount - 1) / lineCount) * 100
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out'
    })
  }, [])

  const toggleMenu = useCallback(() => {
    const target = !openRef.current
    openRef.current = target
    setOpen(target)
    if (target) {
      onMenuOpen?.()
      playOpen()
    } else {
      onMenuClose?.()
      playClose()
    }
    animateIcon(target)
    animateColor(target)
    animateText(target)
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose])

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false
      setOpen(false)
      onMenuClose?.()
      playClose()
      animateIcon(false)
      animateColor(false)
      animateText(false)
    }
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose])

  React.useEffect(() => {
    if (!closeOnClickAway || !open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [closeOnClickAway, open, closeMenu])

  return (
    <div
      className={(className ? className + ' ' : '') + 'staggered-menu-wrapper' + (isFixed ? ' fixed-wrapper' : '')}
      style={accentColor ? ({ '--sm-accent': accentColor } as React.CSSProperties) : undefined}
      data-position={position}
      data-open={open || undefined}
    >
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[3px] pointer-events-auto transition-all duration-300 animate-in fade-in z-0"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {(() => {
          const raw = colors && colors.length ? colors.slice(0, 4) : ['#FFF5CC', '#FFDE59', '#F4D03F']
          let arr = [...raw]
          if (arr.length >= 3) {
            const mid = Math.floor(arr.length / 2)
            arr.splice(mid, 1)
          }
          return arr.map((c, i) => <div key={i} className="sm-prelayer" style={{ background: c }} />)
        })()}
      </div>
      <header className="staggered-menu-header px-6 py-4 flex items-center justify-between border-b border-[#FFF5CC] bg-[#FFFBEB]/90" aria-label="Main navigation header">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 text-[#4A3F00] no-underline" onClick={closeMenu}>
          <Logo size={32} className="sm:w-[36px] sm:h-[36px]" />
          <span className="font-bold text-base tracking-tight text-[#4A3F00] sm-brand-full">Exotika Creation</span>
          <span className="font-bold text-base tracking-tight text-[#4A3F00] sm-brand-short">Exotika</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search Trigger */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
              isSearchOpen ? "bg-[#FFDE59] text-[#4A3F00]" : "bg-[#FFFBEB] text-[#4A3F00]"
            }`}
          >
            <Search className="h-4.5 w-4.5" />
          </button>

          {/* Admin Dashboard */}
          {adminState.isAdmin && (
            <Link 
              to="/admin"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFFBEB] text-[#4A3F00]"
              onClick={closeMenu}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
            </Link>
          )}

          {/* Shopping Cart */}
          <button
            onClick={onCartClick}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFFBEB] text-[#4A3F00]"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {cartState.itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFDE59] text-xs font-bold text-[#4A3F00]">
                {cartState.itemCount}
              </span>
            )}
          </button>

          {/* Toggle button */}
          <button
            ref={toggleBtnRef}
            className="sm-toggle ml-1"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span ref={textWrapRef} className="sm-toggle-textWrap" aria-hidden="true">
              <span ref={textInnerRef} className="sm-toggle-textInner">
                {textLines.map((l, i) => (
                  <span className="sm-toggle-line" key={i}>
                    {l}
                  </span>
                ))}
              </span>
            </span>
            <span ref={iconRef} className="sm-icon" aria-hidden="true">
              <span ref={plusHRef} className="sm-icon-line" />
              <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Collapsible Search input bar */}
      {isSearchOpen && (
        <div className="absolute top-[60px] left-0 w-full px-6 py-2 border-b border-[#FFF5CC] bg-[#FFFBEB]/90 backdrop-blur-sm z-30 flex items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7B00]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border-none bg-white pl-9 pr-4 text-xs font-normal text-[#4A3F00] outline-none focus:outline-2 focus:outline-[#FFDE59]"
              placeholder="Search products..."
              autoFocus
            />
          </form>
        </div>
      )}

      <aside id="staggered-menu-panel" ref={panelRef} className="staggered-menu-panel bg-[#FFFBEB]" aria-hidden={!open}>
        <div className="sm-panel-inner">
          <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
            {dynamicItems && dynamicItems.length ? (
              dynamicItems.map((it, idx) => (
                <li className="sm-panel-itemWrap" key={it.label + idx}>
                  <Link className={`sm-panel-item ${isActive(it.link) ? 'active' : ''}`} to={it.link} onClick={closeMenu}>
                    <span className="sm-panel-itemLabel">{it.label}</span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item">
                  <span className="sm-panel-itemLabel">No items</span>
                </span>
              </li>
            )}
            
            {isAuthenticated && (
              <li className="sm-panel-itemWrap">
                <button
                  onClick={async () => {
                    closeMenu()
                    await logoutUser()
                    navigate("/")
                  }}
                  className="sm-panel-item sm-signout-btn border-none bg-transparent p-0 text-left cursor-pointer outline-none w-full"
                  type="button"
                >
                  <span className="sm-panel-itemLabel">Sign Out</span>
                </button>
              </li>
            )}
          </ul>
          
          {displaySocials && socialItems && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Socials</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i} className="sm-socials-item">
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="sm-socials-link" title={s.label}>
                      {getSocialIcon(s.label)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

export default StaggeredMenu
