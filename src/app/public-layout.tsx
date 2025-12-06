import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Toaster />
    </CartProvider>
  );
}
