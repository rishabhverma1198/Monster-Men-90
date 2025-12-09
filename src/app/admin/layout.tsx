
"use client";

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
} from "@/components/ui/sidebar";
import {
  Package2,
  ShoppingCart,
  Users,
  Boxes,
  Home,
  LogOut,
  Loader2,
  ShieldAlert,
  Server,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useUser } from "@/firebase";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type AuthState = "loading" | "authenticated" | "unauthenticated" | "not-admin";
type VerificationStep = "Verifying Login" | "Checking Admin Privileges" | "Done";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [verificationStep, setVerificationStep] = useState<VerificationStep>("Verifying Login");

  useEffect(() => {
    if (isUserLoading || !firestore) {
      setAuthState("loading");
      setVerificationStep("Verifying Login");
      return;
    }

    if (!user) {
      router.replace("/admin/login");
      setAuthState("unauthenticated");
      return;
    }

    setVerificationStep("Checking Admin Privileges");
    const checkAdminStatus = async () => {
      try {
        const adminDocRef = doc(firestore, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);

        if (adminDoc.exists()) {
          setAuthState("authenticated");
          setVerificationStep("Done");
        } else {
          setAuthState("not-admin");
          if (auth) await signOut(auth);
          router.replace("/admin/login?error=not-admin");
        }
      } catch (error) {
         console.error("Error checking admin status:", error);
         setAuthState("not-admin");
         if (auth) await signOut(auth);
         router.replace("/admin/login?error=firestore-error");
      }
    };

    checkAdminStatus();
  }, [user, isUserLoading, router, auth, firestore]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/admin/login");
    }
  };

  if (authState !== "authenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-full max-w-md p-4 space-y-4">
            {authState === "loading" && (
                <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border">
                    <div className="flex items-center gap-3 text-lg font-semibold">
                        {verificationStep === "Verifying Login" ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserCheck className="h-5 w-5 text-green-500"/>}
                        <span>Verifying Login</span>
                    </div>
                     <div className="flex items-center gap-3 text-lg font-semibold text-muted-foreground">
                        {verificationStep === "Checking Admin Privileges" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Server className="h-5 w-5"/>}
                        <span>Checking Admin Privileges</span>
                    </div>
                </div>
            )}
            {authState === "not-admin" && (
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Access Denied</AlertTitle>
                  <AlertDescription>
                    You are not authorized to view this page. Redirecting to login...
                  </AlertDescription>
                </Alert>
            )}
        </div>
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Package2 className="h-6 w-6 text-accent" />
              <span className="text-lg font-semibold">MonserMens90</span>
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
                    <span>Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Products">
                  <Link href="/admin/products">
                    <Package2 />
                    <span>Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Leads">
                  <Link href="/admin/leads">
                    <Users />
                    <span>Leads</span>
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
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="ml-auto">
              {user && <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`}
                        alt={user.email || "Admin"}
                      />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>}
            </div>
          </header>
          <main className="flex-1 flex flex-col p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
