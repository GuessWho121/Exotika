import { useEffect, useState } from "react"
import { Breadcrumbs } from "../components/Breadcrumbs"
import { CategoryHeader } from "../components/CategoryHeader"
import { ProductCard } from "../components/ProductCard"
import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

interface CategoryPageProps {
  category: "PAINTING" | "CRAFT" | "TOTE_BAG" | "APPAREL"
  title: string
  description: string
  emptyTitle: string
  emptyDescription: string
}

export function CategoryPage({ category, title, description, emptyTitle, emptyDescription }: CategoryPageProps) {
  const [products, setProducts] = useState<any[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState("date_desc")
  const [isLoading, setIsLoading] = useState(true)

  // Reset page when category changes
  useEffect(() => {
    setPage(1)
  }, [category])

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("category", category)
        params.set("page", page.toString())
        params.set("limit", "8")
        params.set("sort", sortBy)

        const res = await fetch(`/api/products?${params.toString()}`)
        if (res.ok) {
          const json = await res.json()
          setProducts(json.data.products || [])
          setTotalResults(json.pagination?.total || 0)
          setTotalPages(json.pagination?.pages || 1)
        }
      } catch (err) {
        console.error("Failed to load category products:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategoryProducts()
  }, [category, page, sortBy])

  // Get breadcrumb label dynamically
  const getBreadcrumbLabel = () => {
    switch (category) {
      case "PAINTING": return "Paintings"
      case "CRAFT": return "Crafts"
      case "TOTE_BAG": return "Tote Bags"
      case "APPAREL": return "Apparel"
    }
  }

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col px-4 md:px-0">
      <Breadcrumbs items={[{ label: "Shop", href: "/" }, { label: getBreadcrumbLabel() }]} />

      <CategoryHeader
        title={title}
        description={description}
      />

      {/* Filter and Sort Bar */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-[#FFF5CC] bg-white p-4 shadow-sm sm:flex-row">
        <p className="text-sm font-medium text-[#8C7B00]">
          Showing <span className="font-bold text-[#4A3F00]">{products.length}</span> of{" "}
          <span className="font-bold text-[#4A3F00]">{totalResults}</span> products
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#8C7B00]">Sort By:</span>
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setPage(1)
              setSortBy(value)
            }}
          >
            <SelectTrigger className="w-[180px] border border-[#8B4513]/30 bg-[#FFFBEB] text-[#4A3F00] focus:border-[#8B4513] focus:ring-0">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-[#FFFBEB]">
              <SelectItem value="date_desc" className="text-[#4A3F00] focus:bg-[#FFDE59]">Newest First</SelectItem>
              <SelectItem value="price_asc" className="text-[#4A3F00] focus:bg-[#FFDE59]">Price: Low to High</SelectItem>
              <SelectItem value="price_desc" className="text-[#4A3F00] focus:bg-[#FFDE59]">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main product display */}
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-[#E6C747]" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold text-[#4A3F00]">{emptyTitle}</h3>
              <p className="text-[#8C7B00]">{emptyDescription}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={`₹${Number(product.price).toFixed(2)}`}
                  image={product.imageUrl}
                  description={product.description}
                  aspectRatio="square"
                  category={product.category?.toLowerCase().replace(/_/g, "-") as any}
                  inStock={product.inStock}
                />
              ))}
            </div>

            {/* Pagination */}
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
  )
}
