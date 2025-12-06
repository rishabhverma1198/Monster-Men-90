import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Package2, ShoppingCart, Users, Boxes, LineChart, Home } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// In a real app, you'd have an authentication wrapper here
// that redirects unauthenticated users to /admin/login.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Package2 className="h-6 w-6 text-accent" />
              <span className="text-lg font-semibold">MonserMens90 Admin</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/admin">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Orders">
                  <Link href="/admin/orders">
                    <ShoppingCart />
                    <span>Track Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Products">
                  <Link href="/admin/products">
                    <Package2 />
                    <span>Upload Items</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Leads">
                  <Link href="/admin/leads">
                    <Users />
                    <span>Handle Leads</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Inventory">
                  <Link href="/admin/inventory">
                    <Boxes />
                    <span>Inventory</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://picsum.photos/seed/admin/100/100" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Admin User</span>
                <span className="text-xs text-muted-foreground">Logout</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <SidebarTrigger className="md:hidden" />
          </div>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
