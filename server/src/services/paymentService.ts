import crypto from "crypto"
import { env } from "../config/env.js"
import { logger } from "../utils/logger.js"

export interface RazorpayOrderResponse {
  id: string // Razorpay Order ID
  amount: number
  currency: string
  receipt: string
  status: string
  isSandbox: boolean
}

// Generates a new order on Razorpay servers
export const createRazorpayOrder = async (
  orderId: string,
  amount: number
): Promise<RazorpayOrderResponse> => {
  const keyId = env.RAZORPAY_KEY_ID
  const keySecret = env.RAZORPAY_KEY_SECRET

  // Fallback to simulated payment parameters if keys are unconfigured
  if (!keyId || !keySecret) {
    logger.warn("⚠️ Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing. Running in simulated Sandbox Mode.")
    return {
      id: `rzp_mock_${orderId}_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: orderId,
      status: "created",
      isSandbox: true
    }
  }

  try {
    const amountInPaise = Math.round(amount * 100) // Razorpay expects amount in paise (1 INR = 100 paise)
    
    logger.info(`Requesting Razorpay Order for Exotika Order ID: ${orderId} (₹${amount})`)
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
    
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: orderId
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      logger.error(`❌ Razorpay Order creation API failed with status ${res.status}: ${errText}`)
      throw new Error(`Razorpay API failure: ${errText}`)
    }

    const data = await res.json() as any
    logger.info(`Successfully created Razorpay Order: ${data.id}`)
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      status: data.status,
      isSandbox: false
    }
  } catch (error) {
    logger.error("❌ Exception during Razorpay Order creation, returning fallback sandbox order:", error)
    return {
      id: `rzp_mock_${orderId}_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: orderId,
      status: "created",
      isSandbox: true
    }
  }
}

// Verifies the authenticity of a Razorpay payment signature
export const verifyRazorpaySignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  const keySecret = env.RAZORPAY_KEY_SECRET

  // Handle mock signatures in sandbox environment
  if (razorpayOrderId.startsWith("rzp_mock_") || !keySecret) {
    const expectedMockSig = `sig_${razorpayOrderId}_${razorpayPaymentId}`
    const isMockValid = razorpaySignature === expectedMockSig
    logger.info(`[SANDBOX] Verifying simulated payment signature. Valid: ${isMockValid}`)
    return isMockValid
  }

  try {
    // Generate HMAC-SHA256 signature
    const hmac = crypto.createHmac("sha256", keySecret)
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`)
    const generatedSignature = hmac.digest("hex")

    const isValid = generatedSignature === razorpaySignature
    logger.info(`[Razorpay Signature Verification] Order ${razorpayOrderId}. Valid: ${isValid}`)
    return isValid
  } catch (error: any) {
    logger.error(`❌ Error verifying Razorpay signature: ${error.message}`)
    return false
  }
}
