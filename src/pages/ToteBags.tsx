import { Breadcrumbs } from "../components/Breadcrumbs"
import { CategoryHeader } from "../components/CategoryHeader"
import { FilterSortBar } from "../components/FilterSortBar"
import { ProductCard } from "../components/ProductCard"
import { Pagination } from "../components/Pagination"
import { useAdmin } from "../contexts/AdminContext"

export function ToteBags() {
  const { state } = useAdmin()
  
  // Get all tote bags from the admin state
  const toteBags = state.products.filter(product => product.category === "tote-bag")

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col">
      <Breadcrumbs items={[{ label: "Shop", href: "/" }, { label: "Tote Bags" }]} />

      <CategoryHeader
        title="Stylish & Unique Tote Bags"
        description="Carry your essentials in style with our unique tote bags, each a canvas of artistic expression. Perfect for everyday use, these bags combine functionality with a touch of personal flair, showcasing original designs and high-quality materials."
      />

      <FilterSortBar productCount={toteBags.length} totalProducts={toteBags.length} />

      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {toteBags.map((bag) => (
          <ProductCard
            key={bag.id}
            id={bag.id}
            title={bag.title}
            price={`₹${bag.price.toFixed(2)}`}
            image={bag.image}
            description={bag.description}
            aspectRatio="square"
          />
        ))}
      </div>

      {toteBags.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-[#4A3F00]">No tote bags available</h3>
            <p className="text-[#8C7B00]">Check back soon for new designs!</p>
          </div>
        </div>
      )}

      <Pagination />
    </div>
  )
}
