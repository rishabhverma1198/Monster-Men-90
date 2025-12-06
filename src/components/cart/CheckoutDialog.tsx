"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "@/app/actions";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// IMPORTANT: Replace with your actual phone number in a .env file
const ADMIN_WHATSAPP_NUMBER = "1234567890"; // Example: for US, it should be like 1XXXXXXXXXX

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { cart, cartTotal, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{orderId: string; whatsappUrl: string} | null>(null);
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({ title: "Your cart is empty", variant: "destructive" });
      return;
    }
    if (!name || !phone) {
      toast({ title: "Please fill in your name and phone number", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);

    try {
      const orderDetails = {
        name,
        phone,
        items: cart,
        status: "Pending" as const,
      };

      const result = await createOrder(orderDetails);

      if (result.success && result.orderId) {
        const orderText = `*New Order: ${result.orderId}*\n\n*Name:* ${name}\n*Phone:* ${phone}\n\n*Items:*\n${cart
          .map(
            (item) =>
              `- ${item.name} (${item.size}) x ${item.quantity} @ $${item.price.toFixed(2)}`
          )
          .join("\n")}\n\n*Total: $${cartTotal.toFixed(2)}*`;

        const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
          orderText
        )}`;

        setOrderSuccessData({ orderId: result.orderId, whatsappUrl });

      } else {
        throw new Error(result.error || "Failed to create order.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Order Failed",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeSuccessDialogAndRedirect = () => {
    if (orderSuccessData) {
      window.open(orderSuccessData.whatsappUrl, '_blank');
      clearCart();
      setName("");
      setPhone("");
      setOrderSuccessData(null);
      onOpenChange(false);
    }
  }

  return (
    <>
      <Dialog open={open && !orderSuccessData} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Please provide your name and phone number to place the order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 123 456 7890"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={isLoading}
              className="bg-accent hover:bg-accent/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Order - ${cartTotal.toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!orderSuccessData}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Order Placed Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your order ID is <strong>{orderSuccessData?.orderId}</strong>. Please save it for tracking. You will now be redirected to WhatsApp to confirm with the admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeSuccessDialogAndRedirect}>
              Continue to WhatsApp
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
