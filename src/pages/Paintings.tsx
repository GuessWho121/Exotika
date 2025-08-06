import { Breadcrumbs } from "../components/Breadcrumbs"
import { CategoryHeader } from "../components/CategoryHeader"
import { FilterSortBar } from "../components/FilterSortBar"
import { ProductCard } from "../components/ProductCard"
import { Pagination } from "../components/Pagination"
import { useAdmin } from "../contexts/AdminContext"

export function Paintings() {
  const { state } = useAdmin()
  
  // Get all paintings from the admin state
  const paintings = state.products.filter(product => product.category === "painting")

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col">
      <Breadcrumbs items={[{ label: "Shop", href: "/" }, { label: "Paintings" }]} />

      <CategoryHeader
        title="Beautiful Original Paintings"
        description="Discover our collection of original paintings that capture the beauty of nature, emotion, and imagination. Each piece is carefully crafted with attention to detail and artistic vision."
      />

      <FilterSortBar productCount={paintings.length} totalProducts={paintings.length} />

      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {paintings.map((painting) => (
          <ProductCard
            key={painting.id}
            id={painting.id}
            title={painting.title}
            price={`₹${painting.price.toFixed(2)}`}
            image={painting.image}
            description={painting.description}
            aspectRatio="square"
          />
        ))}
      </div>

      {paintings.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-[#4A3F00]">No paintings available</h3>
            <p className="text-[#8C7B00]">Check back soon for new artwork!</p>
          </div>
        </div>
      )}

      <Pagination />
    </div>
  )
}
