
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Package, ShoppingCart, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Order, Product } from "@/lib/types";

const salesData = [
  { name: "Jan", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Feb", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Mar", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Apr", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "May", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "Jun", total: 2730 },
];

export default function AdminDashboard() {
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products } = useCollection<Product>(productsQuery);

  const ordersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'orders_leads') : null),
    [firestore]
  );
  const { data: orders } = useCollection<Order>(ordersQuery);

  const totalRevenue = orders
    ? orders.reduce((sum, order) => {
        return sum + order.items.reduce((orderSum, item) => orderSum + (item.price * item.quantity), 0);
      }, 0)
    : 0;

  const recentOrders = orders ? orders.slice(0, 5) : [];


  return (
    <div className="flex w-full flex-col gap-4 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Based on all orders
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{orders?.length || 0}</div>
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
              <div className="text-2xl font-bold">+{orders?.length || 0}</div>
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
              <div className="text-2xl font-bold">{products?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total products in store
              </p>
            </CardContent>
          </Card>
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
                You have {orders?.length || 0} orders in total.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
              {recentOrders?.map(order => (
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
