import { env } from "../config/env.js"
import { logger } from "../utils/logger.js"

export interface ShippingQuote {
  courierName: string
  rate: number
  etd: string // Estimated delivery date
  serviceabilityId: number
}

let shiprocketToken: string | null = null
let tokenExpiry: number | null = null

// Helper to authenticate and retrieve Shiprocket API JWT token
export const getShiprocketToken = async (): Promise<string | null> => {
  const email = env.SHIPROCKET_EMAIL
  const password = env.SHIPROCKET_PASSWORD

  if (!email || !password) {
    logger.warn("⚠️ Shiprocket credentials (SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD) are not configured. Falling back to default shipping rates.")
    return null
  }

  // Token is still active (expire tokens slightly early for safety margins)
  if (shiprocketToken && tokenExpiry && Date.now() < tokenExpiry) {
    return shiprocketToken
  }

  try {
    logger.info("Retrieving new Shiprocket API Auth Token...")
    const res = await fetch("https://apiv2.shiprocket.in/v2/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
      const errText = await res.text()
      logger.error(`❌ Shiprocket auth failed with status ${res.status}: ${errText}`)
      return null
    }

    const data = await res.json() as any
    if (data && data.token) {
      shiprocketToken = data.token
      // Shiprocket tokens are typically valid for 10 days; we expire them in 9 days
      tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000 
      return shiprocketToken
    }
  } catch (error) {
    logger.error("❌ Error authenticating with Shiprocket API:", error)
  }

  return null
}

// Calculates dynamic shipping quotes based on destination postcode
export const calculateShippingQuote = async (
  deliveryPostcode: string,
  totalWeightKg: number = 0.5,
  isCod: boolean = false,
  country: string = "India"
): Promise<ShippingQuote> => {
  // 1. Fallback for International deliveries
  if (country.toLowerCase() !== "india") {
    logger.info(`International delivery requested for ${country}. Applying flat international shipping rate.`)
    return {
      courierName: "DHL Express International",
      rate: 2500.0,
      etd: "10-15 business days",
      serviceabilityId: 0
    }
  }

  // 2. Fetch rates from Shiprocket for domestic delivery
  const token = await getShiprocketToken()
  const pickupPostcode = env.SHIPROCKET_PICKUP_POSTCODE || "110001" // Default pickup PIN code

  if (token) {
    try {
      logger.info(`Fetching Shiprocket rates from ${pickupPostcode} to ${deliveryPostcode} for ${totalWeightKg}kg`)
      const res = await fetch(
        `https://apiv2.shiprocket.in/v2/auth/courier/serviceability?pickup_postcode=${pickupPostcode}&delivery_postcode=${deliveryPostcode}&weight=${totalWeightKg}&cod=${isCod ? 1 : 0}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      )

      if (res.ok) {
        const json = await res.json() as any
        if (json && json.status === 200 && json.data && json.data.available_courier_companies) {
          const companies = json.data.available_courier_companies
          // Filter to find the cheapest carrier option
          if (companies.length > 0) {
            const cheapest = companies.reduce((prev: any, curr: any) => 
              parseFloat(curr.rate) < parseFloat(prev.rate) ? curr : prev
            )

            logger.info(`Shiprocket carrier selected: ${cheapest.courier_name} (Rate: ₹${cheapest.rate})`)
            return {
              courierName: cheapest.courier_name,
              rate: parseFloat(cheapest.rate),
              etd: cheapest.etd || "4-7 business days",
              serviceabilityId: cheapest.id
            }
          }
        }
      } else {
        const errText = await res.text()
        logger.warn(`Shiprocket serviceability endpoint failed: ${errText}`)
      }
    } catch (error) {
      logger.error("Error communicating with Shiprocket serviceability API:", error)
    }
  }

  // 3. Graceful fallback rates if Shiprocket fails or is unconfigured
  logger.info("Applying flat-rate domestic shipping fallback.")
  return {
    courierName: "Express Domestic Shipping",
    rate: 150.0,
    etd: "4-7 business days",
    serviceabilityId: 0
  }
}

// Books a package delivery shipment in the Shiprocket dashboard
export const createShiprocketOrder = async (
  orderId: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  shippingAddress: string,
  shippingCity: string,
  shippingZipCode: string,
  shippingCountry: string,
  orderItems: Array<{ title: string; price: number; quantity: number }>,
  totalAmount: number
): Promise<string | null> => {
  const token = await getShiprocketToken()
  if (!token) {
    logger.warn("Shiprocket token missing. Skipping sandbox order registration.")
    return null
  }

  try {
    const payload = {
      order_id: orderId,
      order_date: new Date().toISOString(),
      pickup_location: env.SHIPROCKET_PICKUP_LOCATION_NAME || "Primary",
      billing_customer_name: customerName,
      billing_last_name: "",
      billing_address: shippingAddress,
      billing_city: shippingCity,
      billing_pincode: shippingZipCode,
      billing_state: shippingCity, // Fallback to city for state
      billing_country: shippingCountry,
      billing_email: customerEmail,
      billing_phone: customerPhone,
      shipping_is_billing: true,
      order_items: orderItems.map((item, idx) => ({
        name: item.title,
        sku: `ART-${idx}`,
        units: item.quantity,
        selling_price: item.price
      })),
      payment_method: "Prepaid",
      sub_total: totalAmount,
      length: 20,
      width: 20,
      height: 10,
      weight: 0.5
    }

    logger.info(`Registering shipment order ${orderId} in Shiprocket sandbox...`)
    const res = await fetch("https://apiv2.shiprocket.in/v2/auth/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      const data = await res.json() as any
      if (data && data.order_id) {
        logger.info(`Successfully created Shiprocket shipment for Order ${orderId}. Shiprocket ID: ${data.shipment_id}`)
        return data.shipment_id ? data.shipment_id.toString() : null
      }
    } else {
      const errText = await res.text()
      logger.error(`❌ Failed to create Shiprocket order: ${errText}`)
    }
  } catch (error) {
    logger.error("Error creating Shiprocket order:", error)
  }

  return null
}
