"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference")

      if (!reference) {
        setStatus("error")
        setMessage("Payment reference not found")
        return
      }

      try {
        const response = await fetch(`/api/paystack/verify?reference=${reference}`)
        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setMessage(data.message || "Payment successful!")

          // Redirect to billing page after 3 seconds
          setTimeout(() => {
            router.push("/dashboard/billing")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.error || "Payment verification failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage("An error occurred while verifying payment")
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-16 w-16 text-green-500" />}
            {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Payment..."}
            {status === "success" && "Payment Successful!"}
            {status === "error" && "Payment Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <p className="text-sm text-muted-foreground mb-4">Redirecting to billing page in 3 seconds...</p>
          )}
          <Button
            onClick={() => router.push("/dashboard/billing")}
            variant={status === "error" ? "default" : "outline"}
            className="w-full"
          >
            {status === "error" ? "Try Again" : "Go to Billing"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
