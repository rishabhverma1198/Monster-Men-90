
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
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type AuthState = "loading" | "authenticated" | "unauthenticated" | "not-admin" | "error";
type VerificationStep = "Initializing..." | "Checking Admin Privileges" | "Creating Admin User" | "Done";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [verificationStep, setVerificationStep] = useState<VerificationStep>("Initializing...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoading || !firestore || !auth) {
      setAuthState("loading");
      setVerificationStep("Initializing...");
      return;
    }

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    setVerificationStep("Checking Admin Privileges");
    setAuthState("loading");

    const checkAdminStatus = async () => {
      try {
        const adminDocRef = doc(firestore, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);

        if (adminDoc.exists()) {
          setAuthState("authenticated");
          setVerificationStep("Done");
        } else {
            if (user.email === "jayantv427@gmail.com") {
                console.log("[AdminLayout] User is default admin email, but not in 'admins' collection. Creating admin entry...");
                setVerificationStep("Creating Admin User");
                const adminData = { isAdmin: true, createdAt: new Date() };
                await setDoc(adminDocRef, adminData);
                setAuthState("authenticated");
                setVerificationStep("Done");
            } else {
                await signOut(auth);
                setAuthState("not-admin");
                router.replace("/admin/login?error=not-admin");
            }
        }
      } catch (error: any) {
         console.error("[AdminLayout] CRITICAL ERROR while checking admin status:", error);
         await signOut(auth);
         setAuthState("error");
         setErrorMessage(`Firestore error: ${error.message}. You have been logged out. Check console and Firestore rules.`);
      }
    };

    checkAdminStatus();
  }, [user, isUserLoading, firestore, auth, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/admin/login");
    }
  };

  const menuItems = [
    { href: "/admin", icon: <Home />, label: "Dashboard" },
    { href: "/admin/orders", icon: <ShoppingCart />, label: "Orders" },
    { href: "/admin/products", icon: <Package2 />, label: "Products" },
    { href: "/admin/leads", icon: <Users />, label: "Leads" },
    { href: "/admin/inventory", icon: <Boxes />, label: "Inventory" },
  ];

  if (authState !== "authenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-full max-w-md p-4 space-y-4">
            {authState === "loading" && (
                <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border">
                    <div className="flex items-center gap-3 text-lg font-semibold">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{verificationStep}...</span>
                    </div>
                </div>
            )}
             {authState === 'unauthenticated' && (
                 <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border">
                    <div className="flex items-center gap-3 text-lg font-semibold">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Redirecting to login...</span>
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
            {authState === "error" && (
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Verification Failed</AlertTitle>
                  <AlertDescription>
                    {errorMessage}
                    <Button onClick={() => router.push('/admin/login')} className="mt-4 w-full">Go to Login</Button>
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
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href}>
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
