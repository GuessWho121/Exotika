import { Filter, ArrowUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

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
        <Select defaultValue="featured">
          <SelectTrigger className="w-full sm:w-48 border border-[#8B4513]/30 bg-[#FFFBEB] text-[#4A3F00] font-medium focus:border-[#8B4513] focus:ring-0">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[#FFFBEB]">
            <SelectItem value="featured" className="text-[#4A3F00] focus:bg-[#FFDE59]">Sort by: Featured</SelectItem>
            <SelectItem value="price_asc" className="text-[#4A3F00] focus:bg-[#FFDE59]">Sort by: Price: Low to High</SelectItem>
            <SelectItem value="price_desc" className="text-[#4A3F00] focus:bg-[#FFDE59]">Sort by: Price: High to Low</SelectItem>
            <SelectItem value="newest" className="text-[#4A3F00] focus:bg-[#FFDE59]">Sort by: Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
