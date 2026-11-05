import React from 'react'
import { Link } from 'react-router-dom'

export interface PillNavItem {
  label: string
  href: string
  ariaLabel?: string
}

export interface PillNavProps {
  logo?: string | React.ReactNode
  logoAlt?: string
  items: PillNavItem[]
  activeHref?: string
  className?: string
  children?: React.ReactNode
}

export const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  children,
}) => {
  const isExternalLink = (href: string) =>
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')

  const isRouterLink = (href: string) => href && !isExternalLink(href)

  return (
    <div className="w-full max-w-7xl px-4 md:px-0 mx-auto">
      <nav
        className={`flex items-center justify-between rounded-full border border-[#FFF5CC] bg-[#FFFBEB]/90 backdrop-blur-md px-4 py-2 shadow-sm ${className}`}
        aria-label="Primary"
      >
        {logo && (
          <div className="flex items-center">
            {isRouterLink(items?.[0]?.href) ? (
              <Link to={items[0].href} aria-label={logoAlt} className="flex items-center">
                {typeof logo === 'string' ? <img src={logo} alt={logoAlt} className="h-9 w-9 object-contain" /> : logo}
              </Link>
            ) : (
              <a href={items?.[0]?.href || '#'} aria-label={logoAlt} className="flex items-center">
                {typeof logo === 'string' ? <img src={logo} alt={logoAlt} className="h-9 w-9 object-contain" /> : logo}
              </a>
            )}
          </div>
        )}

        <div className="hidden lg:flex items-center gap-1">
          <ul className="flex items-center gap-1 list-none m-0 p-0" role="menubar">
            {items.map((item, i) => {
              const isActive = activeHref === item.href
              const basePillClass = `relative px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 no-underline block ${
                isActive
                  ? 'bg-[#FFDE59] text-[#4A3F00] shadow-xs'
                  : 'text-[#4A3F00] hover:bg-[#FFF5CC]/70 hover:text-[#8C7B00]'
              }`

              return (
                <li key={item.href || `item-${i}`} role="none">
                  {isRouterLink(item.href) ? (
                    <Link to={item.href} className={basePillClass} aria-label={item.ariaLabel || item.label}>
                      {item.label}
                    </Link>
                  ) : (
                    <a href={item.href} className={basePillClass} aria-label={item.ariaLabel || item.label}>
                      {item.label}
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {children}
      </nav>
    </div>
  )
}

export default PillNav
