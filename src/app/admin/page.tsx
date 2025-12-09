
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Package, ShoppingCart, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, Timestamp, getCountFromServer } from "firebase/firestore";
import type { Order, Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState }from "react";

const salesData = [
  { name: "Jan", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Feb", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Mar", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Apr", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "May", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Jun", total: 2730 },
];

function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
        </Card>
    )
}

export default function AdminDashboard() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [counts, setCounts] = useState({ products: 0, orders: 0 });
  const [isCounting, setIsCounting] = useState(true);

  useEffect(() => {
    if (!firestore || !user) return;
    
    const fetchCounts = async () => {
      setIsCounting(true);
      try {
        const productsRef = collection(firestore, 'products');
        const ordersRef = collection(firestore, 'orders_leads');
        
        const productsSnap = await getCountFromServer(productsRef);
        const ordersSnap = await getCountFromServer(ordersRef);

        setCounts({
          products: productsSnap.data().count,
          orders: ordersSnap.data().count
        });
      } catch (error) {
        console.error("Error fetching counts: ", error);
        // This might fail if list permission is denied, but getCountFromServer is often more lenient.
        // We will keep the UI robust to this.
        setCounts({ products: 0, orders: 0 });
      } finally {
        setIsCounting(false);
      }
    };

    fetchCounts();
  }, [firestore, user]);


  const recentOrdersQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'orders_leads'), orderBy('createdAt', 'desc'), limit(5)) : null),
    [firestore, user]
  );
  // Note: This recentOrders query might fail if list permission is denied. The UI should handle this gracefully.
  const { data: recentOrders, isLoading: recentOrdersLoading, error: recentOrdersError } = useCollection<Order & { createdAt: Timestamp }>(recentOrdersQuery);
    
  const isLoading = isUserLoading || isCounting;

  return (
    <div className="flex w-full flex-col gap-4 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {isLoading ? (
            <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </>
          ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">N/A</div>
                <p className="text-xs text-muted-foreground">
                  Calculation disabled
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{counts.orders}</div>
                <p className="text-xs text-muted-foreground">
                  Total leads generated
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{counts.orders}</div>
                <p className="text-xs text-muted-foreground">
                  Total orders placed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts.products}</div>
                <p className="text-xs text-muted-foreground">
                  Total products in store
                </p>
              </CardContent>
            </Card>
          </>
          )}
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Recent transactions from your store.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/admin/orders">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={salesData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Displaying last 5 orders.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
              {recentOrdersLoading ? (
                <>
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="grid gap-1 flex-grow">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                 </div>
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="grid gap-1 flex-grow">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                 </div>
                </>
              ) : recentOrdersError ? (
                 <p className="text-sm text-destructive">Could not load recent orders due to permissions.</p>
              ) : recentOrders?.map(order => (
                <div key={order.orderId} className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src={`https://avatar.vercel.sh/${order.name}.png`} alt="Avatar" />
                  <AvatarFallback>{order.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    {order.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.phone}
                  </p>
                </div>
                <div className="ml-auto font-medium">
                    +${order.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                </div>
              </div>
              ))}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
