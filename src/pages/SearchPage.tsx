import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { Breadcrumbs } from "../components/Breadcrumbs"
import { CategoryHeader } from "../components/CategoryHeader"
import { ProductCard } from "../components/ProductCard"
import { Loader2, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

export function SearchPage() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const q = queryParams.get("q") || ""

  // State controls
  const [products, setProducts] = useState<any[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("date_desc")
  const [isLoading, setIsLoading] = useState(true)

  // Reset page when search term changes
  useEffect(() => {
    setPage(1)
  }, [q])

  // Fetch products dynamically based on search query, page, category checklist, and sorting
  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (q) params.set("search", q)
        params.set("page", page.toString())
        params.set("limit", "8")
        params.set("sort", sortBy)
        
        if (selectedCategories.length > 0) {
          params.set("category", selectedCategories.join(","))
        }

        const res = await fetch(`/api/products?${params.toString()}`)
        if (res.ok) {
          const json = await res.json()
          setProducts(json.data.products || [])
          setTotalResults(json.pagination?.totalResults || 0)
          setTotalPages(json.pagination?.totalPages || 1)
        }
      } catch (err) {
        console.error("Failed to load search results:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchResults()
  }, [q, page, selectedCategories, sortBy])

  const handleCategoryToggle = (categoryKey: string) => {
    setPage(1)
    if (selectedCategories.includes(categoryKey)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryKey))
    } else {
      setSelectedCategories([...selectedCategories, categoryKey])
    }
  }

  const categoriesList = [
    { key: "PAINTING", label: "Paintings" },
    { key: "CRAFT", label: "Crafts" },
    { key: "TOTE_BAG", label: "Tote Bags" },
    { key: "APPAREL", label: "Apparel" }
  ]

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col px-4 md:px-0">
      <Breadcrumbs items={[{ label: "Shop", href: "/" }, { label: `Search: "${q}"` }]} />

      <CategoryHeader
        title={`Search Results for "${q}"`}
        description={isLoading ? "Searching catalog..." : `We found ${totalResults} product(s) matching your query.`}
      />

      <div className="flex flex-col gap-8 md:flex-row mt-6">
        {/* Left Column: Filters Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="rounded-xl border border-[#E6C747] bg-white p-6 shadow-sm sticky top-28">
            <div className="flex items-center gap-2 mb-6 border-b border-[#E6C747] pb-3 text-[#4A3F00]">
              <Filter className="h-5 w-5" />
              <h2 className="text-lg font-bold">Filters</h2>
            </div>

            {/* Sort Filter */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#4A3F00] mb-2">Sort By</label>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setPage(1)
                  setSortBy(value)
                }}
              >
                <SelectTrigger className="w-full border border-[#8B4513]/30 bg-[#FFFBEB] text-[#4A3F00] focus:border-[#8B4513] focus:ring-0">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#FFFBEB]">
                  <SelectItem value="date_desc" className="text-[#4A3F00] focus:bg-[#FFDE59]">Newest First</SelectItem>
                  <SelectItem value="price_asc" className="text-[#4A3F00] focus:bg-[#FFDE59]">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc" className="text-[#4A3F00] focus:bg-[#FFDE59]">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-bold text-[#4A3F00] mb-2">Category</label>
              <div className="space-y-2">
                {categoriesList.map((cat) => (
                  <label key={cat.key} className="flex items-center gap-2 text-sm text-[#8C7B00] cursor-pointer hover:text-[#4A3F00]">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.key)}
                      onChange={() => handleCategoryToggle(cat.key)}
                      className="h-4 w-4 rounded border-[#E6C747] text-[#FFDE59] focus:ring-[#FFDE59]"
                    />
                    <span className="font-medium">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Search Results Grid */}
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-[#E6C747]" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-16 text-center">
              <div>
                <h3 className="mb-2 text-xl font-bold text-[#4A3F00]">No products found</h3>
                <p className="text-[#8C7B00] max-w-md mx-auto">
                  Try adjusting your checkboxes or searching for something else like "painting", "craft", or "tote bag".
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={`₹${Number(product.price).toFixed(2)}`}
                    image={product.imageUrl}
                    description={product.description}
                    aspectRatio="square"
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12 py-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-lg border border-[#E6C747] bg-white px-4 py-2 text-sm font-semibold text-[#4A3F00] transition-colors hover:bg-[#FFFBEB] disabled:opacity-40 disabled:hover:bg-white"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-bold text-[#4A3F00]">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-lg border border-[#E6C747] bg-white px-4 py-2 text-sm font-semibold text-[#4A3F00] transition-colors hover:bg-[#FFFBEB] disabled:opacity-40 disabled:hover:bg-white"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
