import { Breadcrumbs } from "../components/Breadcrumbs"
import { CategoryHeader } from "../components/CategoryHeader"
import { FilterSortBar } from "../components/FilterSortBar"
import { ProductCard } from "../components/ProductCard"
import { Pagination } from "../components/Pagination"
import { useAdmin } from "../contexts/AdminContext"

export function Apparel() {
  const { state } = useAdmin()
  
  // Get all apparel from the admin state
  const apparel = state.products.filter(product => product.category === "apparel")

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col">
      <Breadcrumbs items={[{ label: "Shop", href: "/" }, { label: "Apparel" }]} />

      <CategoryHeader
        title="Elegant Handloom Apparel"
        description="Explore our hand-selected apparel collection featuring royal silk sarees, hand-embroidered ladies' kurtas, and lightweight handloom dupattas. Discover the charm of traditional Indian craftsmanship."
      />

      <FilterSortBar productCount={apparel.length} totalProducts={apparel.length} />

      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {apparel.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            title={item.title}
            price={`₹${item.price.toFixed(2)}`}
            image={item.image}
            description={item.description}
            aspectRatio="square"
          />
        ))}
      </div>

      {apparel.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-[#4A3F00]">No apparel items available</h3>
            <p className="text-[#8C7B00]">Check back soon for new arrivals!</p>
          </div>
        </div>
      )}

      <Pagination />
    </div>
  )
}
