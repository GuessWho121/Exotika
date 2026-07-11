import { useState } from "react"
import { useLocation, Link } from "react-router-dom"
import { Instagram, Facebook, Mail, X, Phone, Shield, FileText, Truck, ChevronDown, ChevronUp } from "lucide-react"

export function Footer() {
  const location = useLocation()
  const [activeModal, setActiveModal] = useState<"contact" | "shipping" | "privacy" | "terms" | null>(null)
  
  // Accordion state for mobile view
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    collections: false,
    care: false
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null
  }

  return (
    <footer className="border-t border-[#FFF5CC] bg-gray-50 mt-12 w-full">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-20 xl:px-40">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="border-b border-[#FFF5CC] pb-6 md:border-none md:pb-0">
            <h3 className="mb-3 text-lg font-semibold text-[#4A3F00]">Exotika Creation</h3>
            <p className="mb-4 text-sm text-[#8C7B00] leading-relaxed">
              Handcrafted original artworks, canvas paintings, custom commissions, and artisan tote bags. Made with passion, delivered worldwide.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/exotikacreations?utm_source=qr&igsh=ZHg4bXl5aW9lYm9q" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]"
                title="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.facebook.com/share/1NoVoTJHBa/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]"
                title="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://wa.me/message/3NXIL5VDTOIWL1" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]"
                title="Chat on WhatsApp"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.45L0 24zm12.01-21.867c-5.467 0-9.913 4.446-9.917 9.917-.002 1.902.51 3.75 1.482 5.355l.23.38-1.002 3.661 3.743-.982.37.219c1.533.91 3.283 1.392 5.083 1.393h.005c5.462 0 9.91-4.444 9.914-9.917.002-2.651-1.032-5.144-2.903-7.017-1.872-1.873-4.367-2.909-7.012-2.909zm5.44 13.081c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.174.2-.298.3-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </a>
              <a 
                href="mailto:exotikacreation@gmail.com" 
                className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]"
                title="Send us an Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Collections Column */}
          <div className="border-b border-[#FFF5CC] pb-4 md:border-none md:pb-0">
            <button 
              onClick={() => toggleSection("collections")} 
              className="flex items-center justify-between w-full text-left md:pointer-events-none md:cursor-default outline-none"
            >
              <h3 className="text-lg font-semibold text-[#4A3F00]">Collections</h3>
              <span className="md:hidden text-[#8C7B00]">
                {openSections.collections ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </span>
            </button>
            <ul className={`mt-3 md:mt-0 space-y-2 text-sm leading-6 transition-all duration-300 ${
              openSections.collections ? "block animate-in slide-in-from-top-2 duration-200" : "hidden md:block"
            }`}>
              <li>
                <Link to="/paintings" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                  Canvas Paintings
                </Link>
              </li>
              <li>
                <Link to="/crafts" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                  Handmade Crafts
                </Link>
              </li>
              <li>
                <Link to="/tote-bags" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                  Artisan Tote Bags
                </Link>
              </li>
              <li>
                <Link to="/apparel" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59]">
                  Artistic Apparel
                </Link>
              </li>
              <li>
                <Link to="/custom-order" className="text-[#8C7B00] transition-colors hover:text-[#FFDE59] font-semibold">
                  Request Custom Artwork
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div className="pb-4 md:pb-0">
            <button 
              onClick={() => toggleSection("care")} 
              className="flex items-center justify-between w-full text-left md:pointer-events-none md:cursor-default outline-none"
            >
              <h3 className="text-lg font-semibold text-[#4A3F00]">Customer Care</h3>
              <span className="md:hidden text-[#8C7B00]">
                {openSections.care ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </span>
            </button>
            <ul className={`mt-3 md:mt-0 space-y-2 text-sm leading-6 transition-all duration-300 ${
              openSections.care ? "block animate-in slide-in-from-top-2 duration-200" : "hidden md:block"
            }`}>
              <li>
                <button 
                  onClick={() => setActiveModal("contact")}
                  className="text-[#8C7B00] transition-colors hover:text-[#FFDE59] text-left outline-none"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal("shipping")}
                  className="text-[#8C7B00] transition-colors hover:text-[#FFDE59] text-left outline-none"
                >
                  Shipping & Returns
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal("privacy")}
                  className="text-[#8C7B00] transition-colors hover:text-[#FFDE59] text-left outline-none"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal("terms")}
                  className="text-[#8C7B00] transition-colors hover:text-[#FFDE59] text-left outline-none"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-300 pt-8 text-center text-sm text-[#8C7B00]">
          <p>&copy; {new Date().getFullYear()} Exotika Creation. All rights reserved. Designed with passion.</p>
        </div>
      </div>

      {/* Info Modals Section */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-[#FFF5CC] bg-white p-6 md:p-8 shadow-2xl relative my-8 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 bg-[#FFFBEB] text-[#8C7B00] hover:bg-[#FFDE59]/20 hover:text-[#4A3F00] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {activeModal === "contact" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#FFF5CC] pb-3 text-[#4A3F00]">
                  <Phone className="h-6 w-6 text-[#8B4513]" />
                  <h2 className="text-xl font-bold">Contact & Support</h2>
                </div>
                <div className="text-sm text-[#8C7B00] space-y-3 leading-relaxed">
                  <p>Have questions about a painting, custom orders, or shipping timelines? Get in touch with us directly!</p>
                  <div className="space-y-2 mt-4 bg-[#FFFBEB]/50 p-4 rounded-xl border border-[#FFF5CC]">
                    <div>
                      <strong>Email Support:</strong>
                      <a href="mailto:exotikacreation@gmail.com" className="block text-[#8B4513] font-semibold hover:underline">exotikacreation@gmail.com</a>
                    </div>
                    <div>
                      <strong>WhatsApp Business:</strong>
                      <a href="https://wa.me/message/3NXIL5VDTOIWL1" target="_blank" rel="noopener noreferrer" className="block text-[#8B4513] font-semibold hover:underline">+91 93162 54762</a>
                    </div>
                    <div>
                      <strong>Instagram Direct Message:</strong>
                      <a href="https://www.instagram.com/exotikacreations?utm_source=qr&igsh=ZHg4bXl5aW9lYm9q" target="_blank" rel="noopener noreferrer" className="block text-[#8B4513] font-semibold hover:underline">@exotikacreations</a>
                    </div>
                  </div>
                  <p className="text-xs italic">We typically respond to emails and WhatsApp queries within 2-4 operating hours.</p>
                </div>
              </div>
            )}

            {activeModal === "shipping" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#FFF5CC] pb-3 text-[#4A3F00]">
                  <Truck className="h-6 w-6 text-[#8B4513]" />
                  <h2 className="text-xl font-bold">Shipping & Returns Policy</h2>
                </div>
                <div className="text-sm text-[#8C7B00] space-y-3 leading-relaxed max-h-[50vh] overflow-y-auto pr-2">
                  <h4 className="font-bold text-[#4A3F00] mt-2">1. Order Dispatch & Delivery</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>**Original Artworks & Crafts**: Dispatched within 2-3 business days.</li>
                    <li>**Custom Commissions**: Delivery timelines depend on drying/finish cycles and are aligned during consultation.</li>
                    <li>**Shipping Timelines**: Domestic shipping (India) takes 4-7 business days. International transit takes 10-15 business days.</li>
                  </ul>

                  <h4 className="font-bold text-[#4A3F00] mt-4">2. Packaging Safety</h4>
                  <p>All canvas paintings are safely rolled in heavy-duty tubes or crated flat with triple-layer thermocol protection to prevent transit damage.</p>

                  <h4 className="font-bold text-[#4A3F00] mt-4">3. Return and Replacement</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Original paintings and custom commissions are non-returnable due to the unique nature of original art.</li>
                    <li>If an item is damaged in transit, please share an unboxing video with us within **48 hours** at `exotikacreation@gmail.com` to initiate a replacement or refund processing.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeModal === "privacy" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#FFF5CC] pb-3 text-[#4A3F00]">
                  <Shield className="h-6 w-6 text-[#8B4513]" />
                  <h2 className="text-xl font-bold">Privacy Policy</h2>
                </div>
                <div className="text-sm text-[#8C7B00] space-y-3 leading-relaxed max-h-[50vh] overflow-y-auto pr-2">
                  <p>Exotika Creation respects your personal privacy. This document outlines how we collect, store, and utilize details during checkout cycles.</p>
                  
                  <h4 className="font-bold text-[#4A3F00]">1. Data We Collect</h4>
                  <p>We collect names, shipping addresses, telephone logs, and email addresses to complete order dispatch labels and payment authentication.</p>

                  <h4 className="font-bold text-[#4A3F00] mt-3">2. Processing Integrations</h4>
                  <p>Address search inputs are processed via Google Places Autocomplete API under standard API encryption policies. Payment logs are processed securely via external sandbox token gateways.</p>

                  <h4 className="font-bold text-[#4A3F00] mt-3">3. Cookie Data</h4>
                  <p>We use essential cookies to maintain user session validation logins. No personal trackers or advertisements cookies are deployed.</p>
                </div>
              </div>
            )}

            {activeModal === "terms" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#FFF5CC] pb-3 text-[#4A3F00]">
                  <FileText className="h-6 w-6 text-[#8B4513]" />
                  <h2 className="text-xl font-bold">Terms of Service</h2>
                </div>
                <div className="text-sm text-[#8C7B00] space-y-3 leading-relaxed max-h-[50vh] overflow-y-auto pr-2">
                  <h4 className="font-bold text-[#4A3F00]">1. Intellectual Property</h4>
                  <p>All artworks, original painting designs, artisan prints, canvas photos, and layout graphics on this website belong exclusively to Exotika Creation and the original artist. Reproduction is strictly prohibited.</p>

                  <h4 className="font-bold text-[#4A3F00] mt-3">2. Account Responsibility</h4>
                  <p>Users must provide accurate shipping addresses and billing names during the linear checkout flow. Inaccurate shipping information may delay deliveries.</p>

                  <h4 className="font-bold text-[#4A3F00] mt-3">3. Governing Law</h4>
                  <p>These terms of service and transactions are governed by the laws of India, under local jurisdiction boundaries.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  )
}
