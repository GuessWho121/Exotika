import { Filter, ArrowUpDown } from "lucide-react"

interface FilterSortBarProps {
  productCount: number
  totalProducts: number
}

export function FilterSortBar({ productCount, totalProducts }: FilterSortBarProps) {
  return (
    <div className="mb-6 flex flex-col items-center justify-between gap-4 border-b border-t border-[#FFFBEB] px-4 py-5 sm:flex-row">
      <div className="flex items-center gap-2">
        <button className="rounded-md p-2 text-[#8C7B00] transition-colors hover:bg-[#FFFBEB] hover:text-[#FFDE59]">
          <Filter className="h-6 w-6" />
          <span className="sr-only">Filter</span>
        </button>
        <button className="rounded-md p-2 text-[#8C7B00] transition-colors hover:bg-[#FFFBEB] hover:text-[#FFDE59]">
          <ArrowUpDown className="h-6 w-6" />
          <span className="sr-only">Sort</span>
        </button>
        <span className="text-sm text-[#8C7B00]">
          Showing {productCount} of {totalProducts} products
        </span>
      </div>

      <div className="relative w-full sm:w-auto">
        <select className="block w-full appearance-none rounded-lg border border-transparent bg-[#FFFBEB] px-4 py-2.5 pr-8 text-sm font-medium text-[#4A3F00] outline-none transition-all focus:border-[#FFDE59] focus:ring-2 focus:ring-[#FFDE59]">
          <option>Sort by: Featured</option>
          <option>Sort by: Price: Low to High</option>
          <option>Sort by: Price: High to Low</option>
          <option>Sort by: Newest</option>
        </select>
      </div>
    </div>
  )
}
