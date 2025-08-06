import { Link } from "react-router-dom"

interface BreadcrumbsProps {
  items: Array<{
    label: string
    href?: string
  }>
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg bg-[#FFFBEB] p-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link
              to={item.href}
              className="text-sm font-medium leading-normal text-[#8C7B00] transition-colors hover:text-[#FFDE59] no-underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-sm font-semibold leading-normal text-[#4A3F00]">{item.label}</span>
          )}
          {index < items.length - 1 && <span className="text-sm font-medium leading-normal text-[#8C7B00]">/</span>}
        </div>
      ))}
    </div>
  )
}
