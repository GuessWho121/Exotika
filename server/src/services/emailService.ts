import nodemailer from "nodemailer"
import { env } from "../config/env.js"
import { logger } from "../utils/logger.js"

let transporter: nodemailer.Transporter | null = null

const getTransporter = () => {
  if (transporter) return transporter

  const host = env.SMTP_HOST
  const port = env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : 587
  const user = env.SMTP_USER
  const pass = env.SMTP_PASS

  if (!host || !user || !pass) {
    logger.warn("⚠️ SMTP credentials are not configured. Running Email Service in Developer Console Simulator Mode.")
    return null
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  })

  return transporter
}

export const sendOrderConfirmationEmail = async (
  toEmail: string,
  customerName: string,
  orderId: string,
  items: Array<{ title: string; price: number; quantity: number }>,
  shippingCost: number,
  totalAmount: number
) => {
  const mailTransporter = getTransporter()
  const from = env.SMTP_FROM || `"Exotika Creation" <exotikacreation@gmail.com>`

  const itemRowsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.title}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join("")

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #FFF5CC; background-color: #FFFBEB; color: #4A3F00;">
      <div style="text-align: center; border-bottom: 2px solid #E6C747; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #4A3F00; margin: 0;">Exotika Creation</h1>
        <p style="color: #8C7B00; margin: 5px 0 0 0;">Order Confirmation</p>
      </div>
      
      <p>Dear <strong>${customerName}</strong>,</p>
      <p>Thank you for shopping with Exotika! Your payment has been verified, and order <strong>#${orderId.slice(0, 8)}</strong> has been successfully placed. We are preparing your artwork for dispatch.</p>
      
      <h3 style="color: #4A3F00; border-bottom: 1px solid #E6C747; padding-bottom: 5px;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <thead>
          <tr style="background-color: #FFF5CC;">
            <th style="padding: 8px; text-align: left;">Item</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHtml}
          <tr>
            <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Subtotal:</td>
            <td style="padding: 8px; text-align: right;">₹${(totalAmount - shippingCost).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Shipping Fee:</td>
            <td style="padding: 8px; text-align: right;">₹${shippingCost.toFixed(2)}</td>
          </tr>
          <tr style="background-color: #FFDE59; font-weight: bold;">
            <td colspan="2" style="padding: 8px; text-align: right; font-size: 16px;">Grand Total:</td>
            <td style="padding: 8px; text-align: right; font-size: 16px;">₹${totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style="border-top: 1px solid #E6C747; padding-top: 15px; font-size: 12px; text-align: center; color: #8C7B00; line-height: 1.6;">
        <p>If you have any questions, connect with us at <strong>exotikacreation@gmail.com</strong> or WhatsApp <strong>+91 93162 54762</strong>.</p>
        <p>© 2026 Exotika Creation. All rights reserved.</p>
      </div>
    </div>
  `

  if (!mailTransporter) {
    logger.info(`[EMAIL SIMULATOR] 📨 Order Confirmation Email sent to [${toEmail}] for Order [${orderId}]:\nCustomer: ${customerName}\nTotal: ₹${totalAmount}\nItems:\n${JSON.stringify(items, null, 2)}`)
    return
  }

  try {
    await mailTransporter.sendMail({
      from,
      to: toEmail,
      subject: `🎨 Exotika Creation - Order Confirmation #${orderId.slice(0, 8)}`,
      html: emailHtml
    })
    logger.info(`📧 Order confirmation email successfully sent to ${toEmail}`)
  } catch (err) {
    logger.error("❌ Failed to send order confirmation email via SMTP:", err)
  }
}

export const sendCustomOrderConfirmationEmail = async (
  toEmail: string,
  customerName: string,
  customOrderId: string,
  type: string,
  budget: number,
  description: string
) => {
  const mailTransporter = getTransporter()
  const from = env.SMTP_FROM || `"Exotika Creation" <exotikacreation@gmail.com>`

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #FFF5CC; background-color: #FFFBEB; color: #4A3F00;">
      <div style="text-align: center; border-bottom: 2px solid #E6C747; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #4A3F00; margin: 0;">Exotika Creation</h1>
        <p style="color: #8C7B00; margin: 5px 0 0 0;">Custom Request Confirmed</p>
      </div>
      
      <p>Dear <strong>${customerName}</strong>,</p>
      <p>We have successfully received your custom commission request! Our team will review your specifications and get in touch with you shortly via WhatsApp or email to discuss details, sizes, and drafts.</p>
      
      <h3 style="color: #4A3F00; border-bottom: 1px solid #E6C747; padding-bottom: 5px;">Your Commission Details</h3>
      <div style="background-color: #FFF5CC; padding: 15px; rounded: 8px; font-size: 14px; line-height: 1.6; border: 1px solid #E6C747; margin-bottom: 20px;">
        <div><strong>Request Reference ID:</strong> #${customOrderId}</div>
        <div><strong>Artwork Category:</strong> <span style="text-transform: capitalize;">${type}</span></div>
        <div><strong>Proposed Budget Cap:</strong> ₹${budget.toFixed(2)}</div>
        <div style="margin-top: 10px;"><strong>Project Description:</strong></div>
        <div style="font-style: italic; color: #8C7B00; padding-left: 10px; border-left: 3px solid #E6C747; margin-top: 5px;">"${description}"</div>
      </div>

      <div style="border-top: 1px solid #E6C747; padding-top: 15px; font-size: 12px; text-align: center; color: #8C7B00; line-height: 1.6;">
        <p>If you have any questions, connect with us at <strong>exotikacreation@gmail.com</strong> or WhatsApp <strong>+91 93162 54762</strong>.</p>
        <p>© 2026 Exotika Creation. All rights reserved.</p>
      </div>
    </div>
  `

  if (!mailTransporter) {
    logger.info(`[EMAIL SIMULATOR] 📨 Custom Order Request Email sent to [${toEmail}] for Request [${customOrderId}]:\nCustomer: ${customerName}\nType: ${type}\nBudget: ₹${budget}\nDescription: ${description}`)
    return
  }

  try {
    await mailTransporter.sendMail({
      from,
      to: toEmail,
      subject: `🎨 Exotika Creation - Custom Order Received #${customOrderId.slice(0, 8)}`,
      html: emailHtml
    })
    logger.info(`📧 Custom order received email successfully sent to ${toEmail}`)
  } catch (err) {
    logger.error("❌ Failed to send custom order received email via SMTP:", err)
  }
}
