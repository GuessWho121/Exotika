"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../contexts/CartContext"
import { useAdmin } from "../contexts/AdminContext"
import { useNotifications } from "../contexts/NotificationContext"
import { Input } from "../components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card"
import { X, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import Stepper, { Step } from "../components/Stepper"

declare global {
  interface Window {
    google: any;
  }
}
const getCountryCode = (countryName: string): string => {
  const map: {[key: string]: string} = {
    "india": "IN",
    "united states": "US",
    "united kingdom": "GB",
    "canada": "CA",
    "australia": "AU",
    "germany": "DE",
    "france": "FR",
    "japan": "JP",
    "singapore": "SG",
    "united arab emirates": "AE"
  }
  return map[countryName.toLowerCase()] || ""
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function Checkout() {
  const { state, dispatch } = useCart()
  const { dispatch: adminDispatch, state: adminState } = useAdmin()
  const user = adminState.user
  const { addNotification } = useNotifications()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    zipCode: "",
    country: "India",
  })

  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [saveAddressChecked, setSaveAddressChecked] = useState(false)
  const [addressTitle, setAddressTitle] = useState("Home")

  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAddressVerified, setIsAddressVerified] = useState(false)

  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [sentOtp, setSentOtp] = useState("") // Helper to hold dev-mode OTP for easy testing
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

  // Mock Razorpay payment modal states
  const [showMockPaymentModal, setShowMockPaymentModal] = useState(false)
  const [mockPaymentDetails, setMockPaymentDetails] = useState<{
    orderId: string
    razorpayOrderId: string
    amount: number
  } | null>(null)
  
  // Track active payment state to block background actions and reloads
  const [isPaymentActive, setIsPaymentActive] = useState(false)
  
  // Shipping quote states
  const [shippingQuote, setShippingQuote] = useState<{
    rate: number
    courierName: string
    etd: string
  } | null>(null)
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)

  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(1)
  const stepperRef = useRef<any>(null)

  const isStep1Valid =
    formData.name.trim().length >= 2 &&
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email) &&
    /^\+?[0-9\s\-()]{7,20}$/.test(formData.phone);

  const isStep2Valid =
    (selectedAddressId !== "" && selectedAddressId !== "new") || (
      formData.addressLine1.trim().length >= 1 &&
      formData.addressLine2.trim().length >= 3 &&
      formData.city.trim().length >= 2 &&
      formData.zipCode.trim().length >= 3 &&
      formData.country.trim().length >= 2
    );

  const getNextButtonProps = () => {
    if (activeStep === 1) {
      return { disabled: !isStep1Valid }
    }
    if (activeStep === 2) {
      return { disabled: !isStep2Valid }
    }
    if (activeStep === 3) {
      return { disabled: isProcessing }
    }
    return {}
  }

  // 1. Fetch saved addresses and prefill user info
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        addressLine1: user.address || "",
        city: user.city || "",
        zipCode: user.zipCode || "",
        country: "India"
      }))

      const fetchAddresses = async () => {
        try {
          const res = await fetch("/api/auth/addresses")
          if (res.ok) {
            const json = await res.json()
            const list = json.data.addresses || []
            setSavedAddresses(list)
            if (list.length > 0) {
              setSelectedAddressId("")
              setFormData(prev => ({
                ...prev,
                name: user.name || "",
                phone: user.phone || "",
                addressLine1: "",
                addressLine2: "",
                city: "",
                zipCode: "",
                country: "India"
              }))
            } else {
              setSelectedAddressId("new")
            }
          }
        } catch (err) {
          console.error("Failed to load saved addresses:", err)
        }
      }
      fetchAddresses()
    } else {
      setSelectedAddressId("new")
    }
  }, [user])

  const cleanQueryForGooglePlaces = (query: string): string => {
    let cleaned = query
    // 1. Remove leading room/flat numbers with hyphen/slashes, e.g., "1111 - Block B, SKA..." -> "Block B, SKA..."
    cleaned = cleaned.replace(/^\d+[-/]\d+\s*[-/]?\s*/i, '')
    cleaned = cleaned.replace(/^\d+\s*[-/]\s*/i, '')
    // 2. Remove flat/apartment prefixes, e.g., "Flat 101", "Flat No 101", "Apt 2B", "Apt-2B"
    cleaned = cleaned.replace(/\b(flat|apt|apartment|room|house|villa|no|num|number)\.?\s*\d+[a-zA-Z]?\b\s*[-/,\s]*/i, '')
    // 3. Remove typical unit patterns like "A-101", "F-302", "Block B"
    cleaned = cleaned.replace(/\b[a-zA-Z]-\d+\b\s*[-/,\s]*/i, '')
    cleaned = cleaned.replace(/\b(block|wing|tower)\s*[a-zA-Z0-9]\b\s*[-/,\s]*/i, '')
    // 4. Clean leading commas/spaces
    cleaned = cleaned.replace(/^[,.\-\s]+/, '')
    return cleaned.trim()
  }

  const handleSuggestionSelect = (suggestion: any) => {
    setShowSuggestions(false)
    if (!window.google || !window.google.maps) return

    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'))
    placesService.getDetails(
      {
        placeId: suggestion.place_id,
        fields: ["address_components", "geometry", "name"]
      },
      (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.address_components) {
          let streetAddress = ""
          let sublocality = ""
          let city = ""
          let zipCode = ""
          let country = "India"

          for (const component of place.address_components) {
            const types = component.types
            if (types.includes("street_number")) {
              streetAddress = component.long_name + " " + streetAddress
            } else if (types.includes("route")) {
              streetAddress = streetAddress + component.long_name
            } else if (types.includes("sublocality") || types.includes("neighborhood")) {
              sublocality = sublocality + (sublocality ? ", " : "") + component.long_name
            } else if (types.includes("locality") || types.includes("administrative_area_level_2")) {
              city = component.long_name
            } else if (types.includes("postal_code")) {
              zipCode = component.long_name
            } else if (types.includes("country")) {
              country = component.long_name
            }
          }

          const finalLine2 = [streetAddress.trim(), sublocality.trim()].filter(Boolean).join(", ") || place.name || suggestion.structured_formatting.main_text

          setFormData(prev => ({
            ...prev,
            addressLine2: finalLine2,
            city: city || prev.city,
            zipCode: zipCode || prev.zipCode,
            country: country
          }))
          setIsAddressVerified(true)
        }
      }
    )
  }

  // 1.5. Prevent page reload/unload while checkout payment is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPaymentActive) {
        e.preventDefault()
        e.returnValue = "Your payment is in progress. Closing this tab or reloading will cancel the checkout."
        return e.returnValue
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isPaymentActive])

  // 1.8. Fetch shipping quote prior to review step (Step 3)
  useEffect(() => {
    if (activeStep === 3) {
      const fetchShippingQuote = async () => {
        setIsLoadingShipping(true)
        try {
          const res = await fetch("/api/orders/shipping-quote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shippingZipCode: formData.zipCode,
              shippingCountry: formData.country,
              itemsCount: state.items.reduce((sum, item) => sum + item.quantity, 0)
            })
          })
          const json = await res.json()
          if (res.ok && json.data) {
            setShippingQuote(json.data)
          }
        } catch (err) {
          console.error("Failed to fetch shipping quote:", err)
        } finally {
          setIsLoadingShipping(false)
        }
      }
      fetchShippingQuote()
    }
  }, [activeStep, formData.zipCode, formData.country, state.items])

  // 2. Google Autocomplete dynamic script loader
  useEffect(() => {
    const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY
    if (apiKey) {
      if (!window.google) {
        const scriptId = "google-maps-api-script"
        let script = document.getElementById(scriptId) as HTMLScriptElement
        if (!script) {
          script = document.createElement("script")
          script.id = scriptId
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
          script.async = true;
          script.defer = true;
          script.onload = () => {
            console.log("Google Maps API script loaded successfully programmatically.")
          }
          document.head.appendChild(script)
        }
      }
    }
  }, [])

  // Close suggestions overlay when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [])

  const handleAddressSelect = (addrId: string) => {
    setSelectedAddressId(addrId)
    if (addrId === "new") {
      setFormData(prev => ({
        ...prev,
        addressLine1: "",
        addressLine2: "",
        city: "",
        zipCode: "",
        country: "India"
      }))
    } else {
      const addr = savedAddresses.find(a => a.id === addrId)
      if (addr) {
        setFormData(prev => ({
          ...prev,
          addressLine1: addr.address || "",
          addressLine2: "",
          city: addr.city || "",
          zipCode: addr.zipCode || "",
          country: addr.country || "India"
        }))
        setIsAddressVerified(true)
      }
    }
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }))
    }
  }

  const handleAddressLine1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData(prev => ({ ...prev, addressLine1: val }))
    if (fieldErrors.addressLine1) {
      setFieldErrors(prev => ({ ...prev, addressLine1: false }))
    }
  }

  const handleAddressLine2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData(prev => ({ ...prev, addressLine2: val }))
    setIsAddressVerified(false)
    if (fieldErrors.addressLine2) {
      setFieldErrors(prev => ({ ...prev, addressLine2: false }))
    }

    if (val.trim().length < 3 || !window.google || !window.google.maps || !window.google.maps.places) {
      setAddressSuggestions([])
      setShowSuggestions(false)
      return
    }

    const cleanedQuery = cleanQueryForGooglePlaces(val)
    if (!cleanedQuery) return

    const cc = getCountryCode(formData.country)
    const service = new window.google.maps.places.AutocompleteService()
    service.getPlacePredictions(
      {
        input: cleanedQuery,
        types: ["address"],
        ...(cc ? { componentRestrictions: { country: cc } } : {})
      },
      (predictions: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setAddressSuggestions(predictions)
          setShowSuggestions(true)
        } else {
          setAddressSuggestions([])
          setShowSuggestions(false)
        }
      }
    )
  }


  const triggerCheckoutSubmit = async () => {
    await executeCheckout()
  }

  // Intercepts Step 2 to Step 3 transition to enforce OTP verification for guest/unverified numbers
  const handleBeforeStepChange = async (currentStep: number, nextStep: number) => {
    if (currentStep === 2 && nextStep === 3) {
      const skipOtp = user && (user as any).phoneVerified && formData.phone === user.phone
      
      if (!skipOtp) {
        setIsVerifyingOtp(true)
        try {
          const otpRes = await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contact: formData.phone })
          })

          const otpJson = await otpRes.json()

          if (otpRes.ok) {
            if (otpJson.data && otpJson.data.otp) {
              setSentOtp(otpJson.data.otp)
              addNotification({
                type: "info",
                title: "[DEV MODE] OTP Code Generated",
                message: `Verification code: ${otpJson.data.otp}`,
                duration: 8000
              })
            }
            setShowOtpModal(true)
            return false // Block step advancement
          } else {
            addNotification({
              type: "error",
              title: "Verification Failed",
              message: otpJson.message || "Failed to send OTP.",
              duration: 5000,
            })
            return false
          }
        } catch (err) {
          console.error(err)
          addNotification({
            type: "error",
            title: "Connection Error",
            message: "Failed to connect to the verification server.",
            duration: 5000,
          })
          return false
        } finally {
          setIsVerifyingOtp(false)
        }
      }
    }
    return true
  }

  const executeCheckout = async () => {
    setIsVerifyingOtp(true)
    try {
      // 1. Save Address to Profile Address Book if checked
      if (user && (selectedAddressId === "new" || savedAddresses.length === 0) && saveAddressChecked) {
        try {
          await fetch("/api/auth/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: addressTitle || "Home",
              name: formData.name,
              phone: formData.phone,
              address: `${formData.addressLine1}${formData.addressLine2 ? " | " + formData.addressLine2 : ""}`,
              city: formData.city,
              zipCode: formData.zipCode,
              country: formData.country
            })
          })
        } catch (err) {
          console.error("Failed to save address to address book:", err)
        }
      }

      // 2. Register Checkout Order
      const orderPayload = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: `${formData.addressLine1}${formData.addressLine2 ? " | " + formData.addressLine2 : ""}`,
        shippingCity: formData.city,
        shippingZipCode: formData.zipCode,
        shippingCountry: formData.country,
        items: state.items.map((i) => ({
          productId: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity
        }))
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      })

      const json = await res.json()

      if (res.ok) {
        const { order, razorpayOrder } = json.data
        
        // Mark payment process as active to disable clicks/warn on unload
        setIsPaymentActive(true)

        // Intercept and open simulated modal if running in sandbox mode without Razorpay keys
        if (razorpayOrder.id.startsWith("rzp_mock_")) {
          setMockPaymentDetails({
            orderId: order.id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount / 100
          })
          setShowMockPaymentModal(true)
          setShowOtpModal(false)
          return
        }

        const isScriptLoaded = await loadRazorpayScript()
        if (!isScriptLoaded) {
          setIsPaymentActive(false)
          addNotification({
            type: "error",
            title: "Payment SDK Load Error",
            message: "Failed to load Razorpay payment window. Please check your internet connection.",
            duration: 5000
          })
          return
        }

        const options = {
          key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Exotika Creation",
          description: `Payment for Order #${order.id.slice(0, 8)}`,
          order_id: razorpayOrder.id,
          image: "/logo.svg",
          modal: {
            ondismiss: () => {
              setIsPaymentActive(false)
              addNotification({
                type: "info",
                title: "Checkout Cancelled",
                message: "You closed the payment screen.",
                duration: 4000
              })
            }
          },
          handler: async (response: any) => {
            try {
              setIsProcessing(true)
              addNotification({
                type: "info",
                title: "Processing Payment...",
                message: "Confirming transaction signature and registering shipment...",
                duration: 5000
              })

              const verifyRes = await fetch("/api/orders/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: order.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                })
              })

              const verifyJson = await verifyRes.json()

              if (verifyRes.ok) {
                setIsPaymentActive(false)
                dispatch({ type: "CLEAR_CART" })
                adminDispatch({ type: "SET_LOADING", payload: true }) // Request backend sync

                addNotification({
                  type: "success",
                  title: "Payment Successful!",
                  message: "Your payment was processed and order has been registered.",
                  duration: 5000
                })
                
                setShowOtpModal(false)
                navigate("/order-success")
              } else {
                setIsPaymentActive(false)
                addNotification({
                  type: "error",
                  title: "Payment Verification Failed",
                  message: verifyJson.message || "Failed to confirm payment signature.",
                  duration: 5000
                })
              }
            } catch (err) {
              setIsPaymentActive(false)
              console.error(err)
              addNotification({
                type: "error",
                title: "Connection Error",
                message: "Failed to verify transaction with backend server.",
                duration: 5000
              })
            } finally {
              setIsProcessing(false)
            }
          },
          prefill: {
            name: orderPayload.customerName,
            email: orderPayload.customerEmail,
            contact: orderPayload.customerPhone
          },
          theme: {
            color: "#F4D03F"
          }
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      } else {
        addNotification({
          type: "error",
          title: "Checkout Failed",
          message: json.message || "Failed to register order request.",
          duration: 5000,
        })
      }
    } catch (err) {
      console.error("Order API request error:", err)
      addNotification({
        type: "error",
        title: "Checkout Error",
        message: "Failed to connect to the backend server.",
        duration: 5000,
      })
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleVerifyAndCheckout = async () => {
    setIsVerifyingOtp(true)
    try {
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: formData.phone, otp: otpCode })
      })

      const verifyJson = await verifyRes.json()
      if (!verifyRes.ok) {
        addNotification({
          type: "error",
          title: "OTP Verification Failed",
          message: verifyJson.message || "Invalid OTP code. Please try again.",
          duration: 4000
        })
        setIsVerifyingOtp(false)
        return
      }

      // Mark user's phone verified in profile database table
      if (user) {
        try {
          await fetch("/api/auth/verify-phone", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: formData.phone })
          })
          adminDispatch({ type: "SET_USER", payload: { ...user, phone: formData.phone, phoneVerified: true } })
        } catch (err) {
          console.error("Failed to mark phone verified on backend:", err)
        }
      }

      // Close modal, clean codes and advance to review details (Step 3)
      setShowOtpModal(false)
      setOtpCode("")
      stepperRef.current?.next()
      setIsVerifyingOtp(false)
    } catch (err) {
      console.error("OTP verification request error:", err)
      addNotification({
        type: "error",
        title: "Verification Error",
        message: "Failed to connect to the verification server.",
        duration: 5000,
      })
      setIsVerifyingOtp(false)
    }
  }

  // Simulates verification callback response for mock Razorpay payments
  const handleSimulatePaymentSuccess = async () => {
    if (!mockPaymentDetails) return
    
    const paymentId = `pay_mock_${Math.random().toString(36).substring(2, 10)}`
    const signature = `sig_${mockPaymentDetails.razorpayOrderId}_${paymentId}`

    try {
      setIsProcessing(true)
      addNotification({
        type: "info",
        title: "Processing Mock Payment...",
        message: "Confirming transaction signature and registering shipment...",
        duration: 4000
      })

      const verifyRes = await fetch("/api/orders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: mockPaymentDetails.orderId,
          razorpayOrderId: mockPaymentDetails.razorpayOrderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature
        })
      })

      const verifyJson = await verifyRes.json()

      if (verifyRes.ok) {
        setIsPaymentActive(false)
        dispatch({ type: "CLEAR_CART" })
        adminDispatch({ type: "SET_LOADING", payload: true })

        addNotification({
          type: "success",
          title: "Payment Successful!",
          message: "Mock payment processed and order registered successfully.",
          duration: 5000
        })

        setShowMockPaymentModal(false)
        navigate("/order-success")
      } else {
        setIsPaymentActive(false)
        addNotification({
          type: "error",
          title: "Payment Failed",
          message: verifyJson.message || "Failed to process payment.",
          duration: 5000
        })
      }
    } catch (err) {
      setIsPaymentActive(false)
      console.error(err)
      addNotification({
        type: "error",
        title: "Connection Error",
        message: "Failed to verify transaction with backend server.",
        duration: 5000
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (state.items.length === 0) {
    navigate("/cart")
    return null
  }

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col">
      <h1 className="mb-8 text-3xl font-bold text-[#4A3F00]">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Checkout Stepper Form */}
        <div>
          <Stepper
            ref={stepperRef}
            initialStep={1}
            onStepChange={(step) => setActiveStep(step)}
            onFinalStepCompleted={triggerCheckoutSubmit}
            beforeStepChange={handleBeforeStepChange}
            backButtonText="Previous"
            nextButtonText="Continue"
            nextButtonProps={getNextButtonProps()}
          >
            {/* Step 1: Customer Information */}
            <Step>
              <Card className="border-none bg-transparent shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-semibold text-[#4A3F00]">Customer Information</CardTitle>
                  <CardDescription className="text-[#8C7B00]">Provide your basic identity and contact details.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 px-0 pb-0">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Full Name</label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={fieldErrors.name ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={fieldErrors.email ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Phone</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={fieldErrors.phone ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                      placeholder="Enter phone number"
                    />
                  </div>
                </CardContent>
              </Card>
            </Step>

            {/* Step 2: Shipping Address */}
            <Step>
              <Card className="border-none bg-transparent shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-semibold text-[#4A3F00]">Shipping Address</CardTitle>
                  <CardDescription className="text-[#8C7B00]">Where would you like us to deliver your order?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-0 pb-0">
                  {user && savedAddresses.length > 0 && (
                    <div className="mb-6">
                      <label className="block mb-3 text-sm font-semibold text-[#4A3F00]">Select Delivery Address</label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id
                          return (
                            <div
                              key={addr.id}
                              onClick={() => handleAddressSelect(addr.id)}
                              className={`cursor-pointer rounded-lg border p-4 transition-all duration-200 ${
                                isSelected
                                  ? "border-[#FFDE59] bg-[#FFFBEB] shadow-md ring-2 ring-[#FFDE59]/20"
                                  : "border-[#E6C747] bg-white hover:bg-[#FFFBEB]/50"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <span className="inline-block rounded bg-[#FFDE59] px-2 py-0.5 text-xs font-bold text-[#4A3F00] mb-2 uppercase">
                                  {addr.title}
                                </span>
                                <input
                                  type="radio"
                                  name="selectedAddress"
                                  checked={isSelected}
                                  onChange={() => {}} // Controlled by card click
                                  className="h-4 w-4 text-[#FFDE59] focus:ring-[#FFDE59] border-gray-300"
                                />
                              </div>
                              <div className="text-sm font-semibold text-[#4A3F00] mb-1">{addr.name}</div>
                              <div className="text-xs text-[#8C7B00] space-y-0.5">
                                <div>{addr.address.replace(" | ", ", ")}</div>
                                <div>{addr.city} - {addr.zipCode}</div>
                                <div>{addr.country}</div>
                                <div className="mt-1 font-medium">📞 {addr.phone}</div>
                              </div>
                            </div>
                          )
                        })}
                        
                        {/* Add New Address Card */}
                        <div
                          onClick={() => handleAddressSelect("new")}
                          className={`cursor-pointer rounded-lg border border-dashed p-4 flex flex-col items-center justify-center transition-all duration-200 text-center min-h-[140px] ${
                            selectedAddressId === "new"
                              ? "border-[#FFDE59] bg-[#FFFBEB] shadow-md ring-2 ring-[#FFDE59]/20"
                              : "border-[#E6C747] bg-white hover:bg-[#FFFBEB]/50"
                          }`}
                        >
                          <span className="text-2xl mb-1 text-[#4A3F00]">+</span>
                          <div className="text-sm font-semibold text-[#4A3F00]">Add a New Address</div>
                          <div className="text-xs text-[#8C7B00] mt-1">Enter a new delivery destination</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Form / Summary Section */}
                  {(selectedAddressId === "new" || savedAddresses.length === 0) ? (
                    <div className="space-y-4 pt-2 border-t border-[#E6C747]">
                      {/* Country Dropdown */}
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Country</label>
                        <Select
                          value={formData.country}
                          onValueChange={(val) => setFormData(prev => ({ ...prev, country: val }))}
                        >
                          <SelectTrigger className="w-full border border-[#8B4513]/30 bg-[#FFFBEB] text-[#4A3F00] focus:border-[#8B4513] focus:ring-0">
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#FFFBEB]">
                            <SelectItem value="India" className="text-[#4A3F00] focus:bg-[#FFDE59]">India</SelectItem>
                            <SelectItem value="United States" className="text-[#4A3F00] focus:bg-[#FFDE59]">United States</SelectItem>
                            <SelectItem value="United Kingdom" className="text-[#4A3F00] focus:bg-[#FFDE59]">United Kingdom</SelectItem>
                            <SelectItem value="Canada" className="text-[#4A3F00] focus:bg-[#FFDE59]">Canada</SelectItem>
                            <SelectItem value="Australia" className="text-[#4A3F00] focus:bg-[#FFDE59]">Australia</SelectItem>
                            <SelectItem value="Germany" className="text-[#4A3F00] focus:bg-[#FFDE59]">Germany</SelectItem>
                            <SelectItem value="France" className="text-[#4A3F00] focus:bg-[#FFDE59]">France</SelectItem>
                            <SelectItem value="Japan" className="text-[#4A3F00] focus:bg-[#FFDE59]">Japan</SelectItem>
                            <SelectItem value="Singapore" className="text-[#4A3F00] focus:bg-[#FFDE59]">Singapore</SelectItem>
                            <SelectItem value="United Arab Emirates" className="text-[#4A3F00] focus:bg-[#FFDE59]">United Arab Emirates</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Street Address Line 1 */}
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">
                          Flat, House no., Building, Company, Apartment
                        </label>
                        <Input
                          type="text"
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleAddressLine1Change}
                          className={fieldErrors.addressLine1 ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                          placeholder="e.g. Flat 101, Sunshine Heights"
                        />
                      </div>

                      {/* Street Address Line 2 */}
                      <div ref={containerRef} className="relative">
                        <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">
                          Area, Colony, Street, Sector, Village
                        </label>
                        <Input
                          type="text"
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleAddressLine2Change}
                          className={fieldErrors.addressLine2 ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                          placeholder="e.g. Park Street, Sector 4"
                        />
                        {showSuggestions && addressSuggestions.length > 0 && (
                          <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border border-[#E6C747] bg-[#FFFBEB] shadow-lg divide-y divide-[#FFF5CC]">
                            {addressSuggestions.map((suggestion) => (
                              <li
                                key={suggestion.place_id}
                                onClick={() => handleSuggestionSelect(suggestion)}
                                className="flex items-start gap-2.5 px-4 py-3 cursor-pointer text-sm text-[#4A3F00] hover:bg-[#FFDE59] transition-colors"
                              >
                                <MapPin className="h-4 w-4 mt-0.5 text-[#8C7B00] shrink-0" />
                                <div>
                                  <span className="font-semibold block">
                                    {suggestion.structured_formatting.main_text}
                                  </span>
                                  <span className="text-xs text-[#8C7B00]">
                                    {suggestion.structured_formatting.secondary_text}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                        {isAddressVerified && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-green-600">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-green-600 font-extrabold text-[10px]">✓</span>
                            <span>Verified via Google Maps</span>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Town/City</label>
                          <Input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={fieldErrors.city ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">ZIP/Postal Code</label>
                          <Input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className={fieldErrors.zipCode ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                            placeholder="Enter ZIP code"
                          />
                        </div>
                      </div>
                    </div>
                  ) : selectedAddressId !== "" ? (
                    <div className="p-4 rounded-lg bg-[#FFFBEB]/60 border border-[#E6C747] text-sm text-[#4A3F00] flex items-center justify-between">
                      <div>
                        <div className="font-semibold mb-1">🚚 Delivering to: {formData.name}</div>
                        <div className="text-xs text-[#8C7B00]">
                          {formData.addressLine1} {formData.addressLine2 ? ", " + formData.addressLine2 : ""}, {formData.city} - {formData.zipCode}, {formData.country}
                        </div>
                        <div className="text-xs text-[#8C7B00] mt-0.5">Contact: {formData.phone}</div>
                      </div>
                      <span className="text-[#FFDE59] text-xl font-bold">✓</span>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 text-center font-medium">
                      ⚠️ Please select a shipping address card above to proceed.
                    </div>
                  )}

                  {/* Save Address Checkbox */}
                  {user && (selectedAddressId === "new" || savedAddresses.length === 0) && (
                    <div className="mt-4 space-y-3 border-t border-[#E6C747] pt-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="saveAddressChecked"
                          checked={saveAddressChecked}
                          onChange={(e) => setSaveAddressChecked(e.target.checked)}
                          className="h-4 w-4 rounded border-[#E6C747] text-[#FFDE59] focus:ring-[#FFDE59]"
                        />
                        <label htmlFor="saveAddressChecked" className="ml-2 text-sm text-[#4A3F00] font-medium">
                          Save this address to my profile address book
                        </label>
                      </div>
                      {saveAddressChecked && (
                        <div className="pl-6">
                          <label className="block mb-1.5 text-xs font-semibold text-[#8C7B00]">Address Label (e.g. Home, Work)</label>
                          <Input
                            type="text"
                            value={addressTitle}
                            onChange={(e) => setAddressTitle(e.target.value)}
                            className="h-8 text-sm max-w-xs border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00]"
                            placeholder="Home"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Step>

            {/* Step 3: Review Details */}
            <Step>
              <Card className="border-none bg-transparent shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-semibold text-[#4A3F00]">Review Your Details</CardTitle>
                  <CardDescription className="text-[#8C7B00]">Confirm your delivery details and contact info before completing payment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-0 pb-0">
                  <div className="rounded-lg border border-[#E6C747] bg-[#FFFBEB]/50 p-4 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-[#8C7B00] uppercase tracking-wider">Contact Information</h4>
                      <p className="text-sm font-semibold text-[#4A3F00] mt-1">{formData.name}</p>
                      <p className="text-xs text-[#8C7B00] mt-0.5">{formData.email} | {formData.phone}</p>
                    </div>
                    
                    <hr className="border-[#E6C747]" />

                    <div>
                      <h4 className="text-xs font-bold text-[#8C7B00] uppercase tracking-wider">Shipping Destination</h4>
                      <p className="text-sm font-semibold text-[#4A3F00] mt-1">
                        {formData.addressLine1}
                        {formData.addressLine2 ? `, ${formData.addressLine2}` : ""}
                      </p>
                      <p className="text-xs text-[#8C7B00] mt-0.5">
                        {formData.city} - {formData.zipCode}, {formData.country}
                      </p>
                    </div>

                    <hr className="border-[#E6C747]" />

                    <div>
                      <h4 className="text-xs font-bold text-[#8C7B00] uppercase tracking-wider">Shipping Method</h4>
                      {isLoadingShipping ? (
                        <p className="text-xs text-[#8C7B00] mt-1 animate-pulse">Calculating delivery charges...</p>
                      ) : shippingQuote ? (
                        <div className="mt-1 text-sm">
                          <p className="font-semibold text-[#4A3F00]">{shippingQuote.courierName}</p>
                          <p className="text-xs text-[#8C7B00] mt-0.5">Estimated Delivery: {shippingQuote.etd}</p>
                          <p className="text-xs text-[#8C7B00] mt-0.5">Shipping Fee: <span className="font-bold text-[#4A3F00]">₹{shippingQuote.rate.toFixed(2)}</span></p>
                        </div>
                      ) : (
                        <p className="text-xs text-red-500 mt-1">Unable to estimate shipping charges.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#E6C747] bg-[#FFFBEB] p-4 text-xs text-[#8C7B00] space-y-1.5">
                    <p className="font-semibold text-[#4A3F00]">Notes:</p>
                    <p>• Items will be dispatched within 2-3 working days.</p>
                    <p>• A verification code (OTP) will be sent if the phone number is unverified.</p>
                  </div>
                </CardContent>
              </Card>
            </Step>
          </Stepper>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="border-[#E6C747]">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#4A3F00]">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-[#4A3F00]">{item.title}</h3>
                      <p className="text-sm text-[#8C7B00]">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-[#4A3F00]">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-[#E6C747] pt-4 space-y-1.5 text-sm text-[#8C7B00]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{state.total.toFixed(2)}</span>
                </div>
                {shippingQuote && (
                  <div className="flex justify-between">
                    <span>Shipping ({shippingQuote.courierName})</span>
                    <span>₹{shippingQuote.rate.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold text-[#4A3F00] border-t border-[#E6C747] pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{(state.total + (shippingQuote ? shippingQuote.rate : 0)).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowOtpModal(false)}>
          <div className="w-full max-w-md rounded-lg border border-[#E6C747] bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E6C747] pb-3">
              <h3 className="text-lg font-bold text-[#4A3F00]">Verify Your Phone Number</h3>
              <button onClick={() => setShowOtpModal(false)} className="text-[#8C7B00] hover:text-[#4A3F00]">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="mt-3 text-sm text-[#8C7B00]">
              We have generated a 6-digit verification code for <strong>{formData.phone}</strong>. Please enter it below to complete order:
            </p>

            {/* Developer help notice */}
            {sentOtp && (
              <div className="mt-2 rounded bg-amber-50 border border-amber-200 p-2 text-center text-xs text-[#8C7B00]">
                🔑 <strong>[DEV MODE] Verification OTP is:</strong> <span className="font-mono text-base font-bold text-amber-800 select-all">{sentOtp}</span>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-[#4A3F00] text-center mb-1">Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="block mx-auto w-36 text-center text-2xl tracking-widest font-mono rounded-lg border border-[#E6C747] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-[#E6C747] pt-3">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="rounded-lg border border-[#E6C747] px-4 py-2 text-sm font-medium text-[#4A3F00] hover:bg-[#FFFBEB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={otpCode.length !== 6 || isVerifyingOtp}
                onClick={handleVerifyAndCheckout}
                className="rounded-lg bg-[#FFDE59] px-4 py-2 text-sm font-medium text-[#4A3F00] hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isVerifyingOtp ? "Verifying..." : "Verify & Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Razorpay Payment Modal */}
      {showMockPaymentModal && mockPaymentDetails && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#E6C747] bg-white p-6 shadow-2xl animate-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#FFF5CC] pb-4">
              <div className="h-10 w-10 rounded-lg bg-[#FFDE59] flex items-center justify-center shrink-0 shadow-sm border border-[#E6C747]">
                <span className="font-extrabold text-[#4A3F00] text-sm">R</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#4A3F00] leading-none">Razorpay Checkout</h3>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold uppercase tracking-wider mt-1 inline-block font-sans">Sandbox Mode</span>
              </div>
            </div>

            {/* Body */}
            <div className="py-6 space-y-4 text-[#8C7B00] text-sm">
              <div className="flex justify-between items-center bg-[#FFFBEB] p-4 rounded-xl border border-[#FFF5CC]">
                <span className="font-medium text-[#4A3F00]">Amount to Pay:</span>
                <span className="text-xl font-extrabold text-[#4A3F00]">₹{mockPaymentDetails.amount.toFixed(2)}</span>
              </div>

              <div className="text-xs space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-200 leading-relaxed font-mono">
                <div><strong>Order Reference:</strong> #{mockPaymentDetails.orderId.slice(0, 8)}...</div>
                <div><strong>Mock Razorpay ID:</strong> {mockPaymentDetails.razorpayOrderId}</div>
              </div>

              <div className="text-center text-xs text-[#8C7B00] italic">
                This is a simulated Razorpay overlay because the server is running without live credentials. Clicking the button below will trigger a secure sandbox payment callback.
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-[#FFF5CC] pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowMockPaymentModal(false)
                  setIsPaymentActive(false)
                  addNotification({
                    type: "info",
                    title: "Payment Cancelled",
                    message: "The customer cancelled the payment sequence.",
                    duration: 4000
                  })
                }}
                className="flex-1 py-3 text-sm font-semibold rounded-xl border border-gray-300 text-[#4A3F00] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSimulatePaymentSuccess}
                className="flex-1 py-3 text-sm font-semibold rounded-xl bg-[#4A3F00] text-white hover:bg-[#6b5a00] active:scale-[0.98] transition-all shadow-sm"
              >
                {isProcessing ? "Processing..." : `Pay ₹${mockPaymentDetails.amount.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen click blocker overlay during active payment */}
      {isPaymentActive && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/10 cursor-not-allowed" 
          title="Payment is in progress. Please complete the transaction in the overlay."
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            addNotification({
              type: "warning",
              title: "Payment in Progress",
              message: "Please complete or cancel the transaction in the payment window.",
              duration: 3500
            })
          }}
        />
      )}
    </div>
  )
}
