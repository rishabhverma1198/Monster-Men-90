"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trackOrder } from "@/app/actions";
import { Loader2, CheckCircle } from "lucide-react";
import type { Order } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const STATUSES: Order['status'][] = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOrder(null);
    setError(null);
    
    const result = await trackOrder(orderId, phone);

    if (result.success && result.order) {
      setOrder(result.order);
    } else {
      setError(result.error || "Failed to find order.");
    }

    setIsLoading(false);
  };

  const currentStatusIndex = order ? STATUSES.indexOf(order.status) : -1;

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Track Your Order</CardTitle>
          <CardDescription>Enter your order ID and phone number to see the status of your order.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order-id">Order ID</Label>
              <Input
                id="order-id"
                placeholder="MM90-XXXXXX"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Track Order
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {order && (
            <div className="mt-8">
              <h3 className="text-lg font-bold">Order Status: {order.orderId}</h3>
              <p className="text-muted-foreground">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
              
              <div className="mt-6">
                <ol className="relative border-l border-gray-200 dark:border-gray-700">
                  {STATUSES.map((status, index) => (
                    <li key={status} className={`ml-6 mb-10 ${index <= currentStatusIndex ? '' : 'opacity-50'}`}>
                      <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-blue-900 ${index <= currentStatusIndex ? 'bg-accent' : 'bg-gray-300'}`}>
                        {index <= currentStatusIndex && <CheckCircle className="w-5 h-5 text-white" />}
                      </span>
                      <h4 className="font-semibold text-lg">{status}</h4>
                      {index === currentStatusIndex && <p className="text-sm text-muted-foreground">Current Status</p>}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
