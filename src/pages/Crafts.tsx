import { Breadcrumbs } from "../components/Breadcrumbs"
import { CategoryHeader } from "../components/CategoryHeader"
import { FilterSortBar } from "../components/FilterSortBar"
import { ProductCard } from "../components/ProductCard"
import { Pagination } from "../components/Pagination"
import { useAdmin } from "../contexts/AdminContext"

export function Crafts() {
  const { state } = useAdmin()
  
  // Get all crafts from the admin state
  const crafts = state.products.filter(product => product.category === "craft")

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col">
      <Breadcrumbs items={[{ label: "Shop", href: "/" }, { label: "Crafts" }]} />

      <CategoryHeader
        title="Handmade Crafts & Decor"
        description="Explore our collection of handcrafted items that bring warmth and personality to your home. Each piece is carefully made with traditional techniques and modern design sensibilities."
      />

      <FilterSortBar productCount={crafts.length} totalProducts={crafts.length} />

      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {crafts.map((craft) => (
          <ProductCard
            key={craft.id}
            id={craft.id}
            title={craft.title}
            price={`₹${craft.price.toFixed(2)}`}
            image={craft.image}
            description={craft.description}
            aspectRatio="square"
          />
        ))}
      </div>

      {crafts.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-[#4A3F00]">No crafts available</h3>
            <p className="text-[#8C7B00]">Check back soon for new handmade items!</p>
          </div>
        </div>
      )}

      <Pagination />
    </div>
  )
}
