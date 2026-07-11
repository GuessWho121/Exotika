import { PrismaClient, Category, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Clear existing records
  await prisma.customOrderReference.deleteMany()
  await prisma.customOrder.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  console.log("Database cleared.")

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash("Admin@123", salt)
  const customerPasswordHash = await bcrypt.hash("Customer@123", salt)

  // Seed Users
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@exotika.com",
      passwordHash,
      name: "Admin Sarah",
      role: Role.ADMIN,
      phone: "9988776655",
      address: "Studio 42, Art Street",
      city: "Mumbai",
      zipCode: "400001"
    }
  })

  const customerUser = await prisma.user.create({
    data: {
      email: "customer@exotika.com",
      passwordHash: customerPasswordHash,
      name: "Rahul Sharma",
      role: Role.CUSTOMER,
      phone: "9876543210",
      address: "Flat 101, Green Heights, Bandra",
      city: "Mumbai",
      zipCode: "400050"
    }
  })

  console.log("Users seeded successfully.")

  // Seed Products
  const productsData = [
    {
      title: "Vibrant Sunset",
      price: 15000.00,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQXUUOu8-Ftxlj8LN_4MLnolOEWM838mOfrJi7oXk9dMFcN_rus5L5fhypsp3oTu89tKlE1UE3fMY_kpx_aHjbDlrFT7KBoQ1Bfd-T2-iz2qx1StCNV2dNySE7IwBrVmUgHiTve1-kXSk165bS-HxerPVVOK0k5Nx67tLyyqzbVpnDl2r_nHJfJABsdM-QUx4dJpZByiVvOIflPKMqaYYVpRc2c9nWBay5V9gGIRuES59Wu7I3--zKZCGtAXX9o4JS6d5uxu10M2yQ",
      description: "A beautiful hand-painted canvas depicting a vibrant sunset over the horizon.",
      category: Category.PAINTING,
      inStock: true,
      height: "20",
      width: "16",
      medium: "Acrylic on Canvas"
    },
    {
      title: "Handmade Ceramic Bowl",
      price: 3750.00,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWhaAhSnzROQO65Ls7V8WOBWoQvUowtQc6afr-mJpB28BvHKIPoYZtDWHS-L7HTtLK1x3WVxhfO2c88w76keXDO9fFq8nBesMq3-xWxSOlGgx9O_283gPrEVjqd-uSudzaldRJGCtEX9Jj8eBBKzTeCk-_SBAP_dxThVFwoi8jZ3RR91uWuef94TJoQ3yPwNE8HpOltcdijf4eHeOVkUtx1ICgxY9ugrB-DX1dBNGkm2fRDM-qM-apabS0bIodBpwo78wmynQ-9Qjt",
      description: "Artisanal glazed ceramic bowl, uniquely crafted and kiln-fired for high durability.",
      category: Category.CRAFT,
      inStock: true
    },
    {
      title: "Floral Symphony Tote",
      price: 2100.00,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPq7r7Zc_62QlWRGfVq2E81FmWGpCWCfdIO3RghgDn_Zdcu9e7Wwu0-Jids6xuc8-_NunsHE814Y90nmV5JR13av-CHX0i6AgJjrA_42DuExbqZLUPloD6S13XOw-xE22VOkX0amWoaaQZ5nrjm7z11dKC9X3uAkKHdcSSO_Nl0cYtTammHcu7wlGNvmsvtwyOLlYGaqZQwAw1gvphLDRRJZuzuAqLwIIU4nMNGtomk42CP7Ej8VRLZahnzLLNM07Cn5T_zv8y8kY-",
      description: "Premium cotton tote bag hand-printed with unique colorful floral patterns.",
      category: Category.TOTE_BAG,
      inStock: true
    },
    {
      title: "Royal Kora Silk Saree",
      price: 12500.00,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQXUUOu8-Ftxlj8LN_4MLnolOEWM838mOfrJi7oXk9dMFcN_rus5L5fhypsp3oTu89tKlE1UE3fMY_kpx_aHjbDlrFT7KBoQ1Bfd-T2-iz2qx1StCNV2dNySE7IwBrVmUgHiTve1-kXSk165bS-HxerPVVOK0k5Nx67tLyyqzbVpnDl2r_nHJfJABsdM-QUx4dJpZByiVvOIflPKMqaYYVpRc2c9nWBay5V9gGIRuES59Wu7I3--zKZCGtAXX9o4JS6d5uxu10M2yQ",
      description: "Exquisite hand-woven Kora silk saree featuring traditional gold zari borders and a rich pallu. Perfect for festive celebrations and weddings.",
      category: Category.APPAREL,
      inStock: true
    },
    {
      title: "Hand-Embroidered Anarkali Kurta",
      price: 4800.00,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWhaAhSnzROQO65Ls7V8WOBWoQvUowtQc6afr-mJpB28BvHKIPoYZtDWHS-L7HTtLK1x3WVxhfO2c88w76keXDO9fFq8nBesMq3-xWxSOlGgx9O_283gPrEVjqd-uSudzaldRJGCtEX9Jj8eBBKzTeCk-_SBAP_dxThVFwoi8jZ3RR91uWuef94TJoQ3yPwNE8HpOltcdijf4eHeOVkUtx1ICgxY9ugrB-DX1dBNGkm2fRDM-qM-apabS0bIodBpwo78wmynQ-9Qjt",
      description: "Elegant floor-length Anarkali kurta crafted from premium cotton with delicate Chikankari embroidery. Designed for comfort and high-end style.",
      category: Category.APPAREL,
      inStock: true
    },
    {
      title: "Chanderi Handloom Dupatta",
      price: 2100.00,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPq7r7Zc_62QlWRGfVq2E81FmWGpCWCfdIO3RghgDn_Zdcu9e7Wwu0-Jids6xuc8-_NunsHE814Y90nmV5JR13av-CHX0i6AgJjrA_42DuExbqZLUPloD6S13XOw-xE22VOkX0amWoaaQZ5nrjm7z11dKC9X3uAkKHdcSSO_Nl0cYtTammHcu7wlGNvmsvtwyOLlYGaqZQwAw1gvphLDRRJZuzuAqLwIIU4nMNGtomk42CP7Ej8VRLZahnzLLNM07Cn5T_zv8y8kY-",
      description: "A lightweight, semi-sheer Chanderi cotton-silk dupatta adorned with intricate hand-painted floral motifs and zari borders.",
      category: Category.APPAREL,
      inStock: true
    }
  ]

  const seededProducts = []
  for (const productInfo of productsData) {
    const prod = await prisma.product.create({
      data: productInfo
    })
    seededProducts.push(prod)
  }

  console.log("Catalog products seeded successfully.")

  // Seed Dummy Reviews
  console.log("Seeding dummy reviews...")
  for (const prod of seededProducts) {
    await prisma.review.create({
      data: {
        productId: prod.id,
        userId: customerUser.id,
        rating: 5,
        comment: `Absolutely loved this! The quality of "${prod.title}" is outstanding. Highly recommend Exotika Creation!`
      }
    })

    await prisma.review.create({
      data: {
        productId: prod.id,
        userId: adminUser.id,
        rating: 4,
        comment: "Beautiful design and craftsmanship. Shipping was prompt and packaging was secure."
      }
    })
  }
  console.log("Dummy reviews seeded successfully.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
