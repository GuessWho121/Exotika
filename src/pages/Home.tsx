import { Link } from "react-router-dom"
import { ProductCard } from "../components/ProductCard"
import { useAdmin } from "../contexts/AdminContext"

export function Home() {
  const { state } = useAdmin()

  // Get featured products from the admin state
  const featuredArtworks = state.products.filter(p => p.category === "painting").slice(0, 3)
  const featuredCrafts = state.products.filter(p => p.category === "craft").slice(0, 3)
  const featuredToteBags = state.products.filter(p => p.category === "tote-bag").slice(0, 3)

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="p-0 @[480px]:p-4">
        <div
          className="relative flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-3xl bg-cover bg-center bg-no-repeat p-8 text-center shadow-2xl @[480px]:gap-8 @[640px]:min-h-[480px]"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(74, 63, 0, 0.7) 50%, rgba(0, 0, 0, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuD09F9CiRzOQRnuhU0gzlMrM5xEu1BdDp6TCCPW3uJTXpDqgC2jbqhtHBZjcu4bgsV9-N5fvJvz1_B5QGd_1vLvwtNyKTNnxUV5GaEVo-Vz7P0ctroSB34dC_emTCFH8PnhDCvDYZ7wgDZkI9m0mKmzO4MeQ5q1mzeDled63uYGowLIYhNx2hjEkka-lOgqRBLau8nvb4KQZKqnz4VfISP2bH2fSOJXO44XIe660y4DdOL4QpHmh251tkpa1n3HI691cF1jEueQ5F0j")`,
          }}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-black/20 via-transparent to-black/10 backdrop-blur-[1px]" />
          <div className="relative z-10 flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg @[480px]:text-5xl @[768px]:text-6xl">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-[#FFDE59] to-[#F4D03F] bg-clip-text text-transparent drop-shadow-lg">
                  Exotika Creation
                </span>
              </h1>
              <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-[#FFDE59] to-[#F4D03F] shadow-lg"></div>
            </div>
            <h2 className="text-lg font-medium leading-relaxed text-white/95 drop-shadow-md @[480px]:text-xl max-w-2xl mx-auto">
              Where art meets passion. Discover unique handcrafted artworks, beautiful crafts, and stylish tote bags 
              created with love by a passionate artist who believes every piece tells a story.
            </h2>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-center">
            <Link 
              to="/paintings"
              className="group flex h-14 min-w-[160px] items-center justify-center overflow-hidden rounded-2xl bg-[#FFDE59] px-8 text-base font-bold leading-normal tracking-[0.015em] text-[#4A3F00] shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:bg-[#F4D03F] @[480px]:px-10 no-underline"
            >
              <span className="truncate">Explore Collection</span>
            </Link>
            <Link 
              to="/custom-order"
              className="group flex h-14 min-w-[160px] items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white/90 backdrop-blur-sm px-8 text-base font-bold leading-normal tracking-[0.015em] text-[#4A3F00] shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:bg-white @[480px]:px-10 no-underline"
            >
              <span className="truncate">Custom Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Artworks */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#4A3F00]">
            Featured Artworks
          </h2>
          <Link 
            to="/paintings" 
            className="text-sm font-medium text-[#4A3F00] hover:text-[#FFDE59] transition-colors no-underline"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredArtworks.map((artwork) => (
            <ProductCard
              key={artwork.id}
              id={artwork.id}
              title={artwork.title}
              price={`₹${artwork.price.toFixed(2)}`}
              image={artwork.image}
              description={artwork.description}
              aspectRatio="4/3"
            />
          ))}
        </div>
      </section>

      {/* Featured Crafts */}
      <section className="my-8 rounded-2xl bg-[#FFF5CC] py-12">
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#4A3F00]">
            Featured Crafts
          </h2>
          <Link 
            to="/crafts" 
            className="text-sm font-medium text-[#4A3F00] hover:text-[#FFDE59] transition-colors no-underline"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCrafts.map((craft) => (
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
      </section>

      {/* Featured Tote Bags */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#4A3F00]">
            Featured Tote Bags
          </h2>
          <Link 
            to="/tote-bags" 
            className="text-sm font-medium text-[#4A3F00] hover:text-[#FFDE59] transition-colors no-underline"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredToteBags.map((bag) => (
            <ProductCard
              key={bag.id}
              id={bag.id}
              title={bag.title}
              price={`₹${bag.price.toFixed(2)}`}
              image={bag.image}
              description={bag.description}
              aspectRatio="3/4"
            />
          ))}
        </div>
      </section>

      {/* About the Artist */}
      <section className="py-12 px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-[#4A3F00]">About the Artist</h2>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-[#FFDE59] shadow-lg">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/artist-picture-kdML3OZTrU1u1XG8SYK0KBPJIApFIX.webp"
              alt="Sarah - Artist and Creator"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mb-6 text-lg font-normal leading-relaxed text-[#4A3F00]">
            Meet Sarah, the creative force behind Exotika Creation. With a profound passion for creativity and a deep
            love for the natural world, Sarah pours her heart into crafting unique artworks, handmade crafts, and
            stylish tote bags that beautifully reflect her distinct artistic vision. Each piece is meticulously created
            with an unwavering attention to detail and a steadfast commitment to exceptional quality.
          </p>
          <Link 
            to="/profile"
            className="mx-auto flex h-12 min-w-[120px] max-w-[480px] transform items-center justify-center overflow-hidden rounded-xl bg-[#FFDE59] px-6 text-base font-bold leading-normal tracking-[0.015em] text-[#4A3F00] shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-opacity-90 hover:shadow-lg @[480px]:h-14 @[480px]:px-8 no-underline"
          >
            <span className="truncate">Learn More About Sarah</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
