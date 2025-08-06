import { Instagram, Users, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-[#FFF5CC] bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-20 xl:px-40">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-[#4A3F00]">Exotika Creation</h3>
            <p className="mb-4 text-sm text-[#8C7B00]">
              Unique artworks, crafts, and tote bags by a passionate artist.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                <Users className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-[#4A3F00]">Quick Links</h3>
            <ul className="space-y-2 text-sm leading-6">
              <li>
                <a href="#" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                  Shop All
                </a>
              </li>
              <li>
                <a href="#" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                  Best Sellers
                </a>
              </li>
              <li>
                <a href="#" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-[#4A3F00]">Customer Service</h3>
            <ul className="space-y-2 text-sm leading-6">
              <li>
                <a href="#" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-300 pt-8 text-center text-sm text-[#8C7B00]">
          <p>&copy; 2024 Exotika Creation. All rights reserved. Designed with passion.</p>
        </div>
      </div>
    </footer>
  )
}
