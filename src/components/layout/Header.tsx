"use client";

import Link from "next/link";
import { Package2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CartSheet from "@/components/cart/CartSheet";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <nav className="flex-col hidden gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 w-full">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6 text-accent" />
          <span className="font-bold">MonserMens90</span>
        </Link>
        <div className="flex items-center gap-4 md:gap-2 md:ml-auto md:grow-0">
          <Button variant="link" asChild>
            <Link href="/products">Products</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/track-order">Track Order</Link>
          </Button>
          <CartSheet>
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full p-2"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          </CartSheet>
        </div>
      </nav>
      {/* Mobile Header */}
      <div className="flex md:hidden items-center w-full">
         <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Package2 className="h-6 w-6 text-accent" />
          <span className="font-bold">MonserMens90</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="link" asChild size="sm">
                <Link href="/track-order">Track</Link>
            </Button>
            <CartSheet>
            <Button variant="outline" size="icon" className="relative h-9 w-9">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-2 text-xs"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          </CartSheet>
        </div>
      </div>
    </header>
  );
}
