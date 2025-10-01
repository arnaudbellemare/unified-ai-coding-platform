'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const chargeId = searchParams?.get('charge_id')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">Thank you for your purchase! Your payment has been processed successfully.</p>

          {chargeId && (
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                Transaction ID: <span className="font-mono text-xs">{chargeId}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              You will receive a confirmation email shortly with your order details.
            </p>
            <p className="text-sm text-gray-600">Your items will be shipped within 1-2 business days.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/store">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
