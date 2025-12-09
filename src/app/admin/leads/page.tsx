
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Ban, CheckCircle } from "lucide-react";
import type { Order } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

interface Lead {
    name: string;
    phone: string;
    orderIds: string[];
    totalSpent: number;
}

const getLeadsFromOrders = (orders: (Order & { createdAt: Timestamp })[] | null): Lead[] => {
  if (!orders) return [];
  const leadsMap = new Map<string, Lead>();

  orders.forEach(order => {
    const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const existingLead = leadsMap.get(order.phone);
    if (existingLead) {
      existingLead.orderIds.push(order.orderId);
      existingLead.totalSpent += total;
    } else {
      leadsMap.set(order.phone, {
        name: order.name,
        phone: order.phone,
        orderIds: [order.orderId],
        totalSpent: total,
      });
    }
  });

  return Array.from(leadsMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
};

function LeadRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell className="text-center"><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
            <TableCell className="text-center"><div className="flex justify-center gap-2"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /></div></TableCell>
        </TableRow>
    )
}

export default function LeadsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const ordersQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'orders_leads'), orderBy('createdAt', 'desc')) : null),
    [firestore, user]
  );
  const { data: orders, isLoading } = useCollection<Order & { createdAt: Timestamp }>(ordersQuery);
  const leads = useMemo(() => getLeadsFromOrders(orders), [orders]);
  
  const dataLoading = isLoading || isUserLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Leads</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Leads</CardTitle>
          <CardDescription>
            Manage and interact with customers who have placed orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataLoading ? (
                <>
                    <LeadRowSkeleton />
                    <LeadRowSkeleton />
                    <LeadRowSkeleton />
                    <LeadRowSkeleton />
                </>
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <TableRow key={lead.phone}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{lead.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge variant="secondary">{lead.orderIds.length}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${lead.totalSpent.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Button variant="outline" size="sm">
                           <CheckCircle className="mr-2 h-4 w-4" />
                           Contacted
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Ban className="mr-2 h-4 w-4" />
                           Blacklist
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
