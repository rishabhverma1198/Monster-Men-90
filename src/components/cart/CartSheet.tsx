"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import CheckoutDialog from "./CheckoutDialog";
import { useState } from "react";

export default function CartSheet({ children }: { children: React.ReactNode }) {
  const { cart, removeFromCart, updateQuantity, cartTotal, itemCount } = useCart();
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isSheetOpen, setSheetOpen] = useState(false);


  const handleCheckout = () => {
    setSheetOpen(false);
    setCheckoutOpen(true);
  }

  return (
    <>
    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cart.length > 0 ? (
          <>
            <ScrollArea className="flex-grow">
              <div className="flex flex-col gap-4 pr-6">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex items-center gap-4">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden">
                        <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.productId, item.size)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="mt-4">
              <div className="w-full">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">Add some products to get started.</p>
            <SheetClose asChild>
                <Button className="mt-4" variant="outline">Continue Shopping</Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
    <CheckoutDialog open={isCheckoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  );
}
