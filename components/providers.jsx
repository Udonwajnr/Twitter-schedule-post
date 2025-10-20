"use client"

import React from "react"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  )
}
