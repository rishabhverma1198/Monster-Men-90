
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


function LeadsRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
    </TableRow>
  )
}

export default function LeadsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // We fetch all orders to display as leads. This is okay for a small number of orders.
  // For a large number of orders, pagination would be required.
  const leadsQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'orders_leads') : null),
    [firestore, user]
  );
  const { data: leads, isLoading } = useCollection<Order>(leadsQuery);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    if (!firestore || !user) return;
    const leadRef = doc(firestore, 'orders_leads', orderId);
    const updatedData = { status: newStatus };
    
    updateDoc(leadRef, updatedData)
        .then(() => {
            toast({
                title: "Status Updated",
                description: `Lead ${orderId} status changed to ${newStatus}.`,
            });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: leadRef.path,
                operation: 'update',
                requestResourceData: updatedData
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const handleTrackOrder = (order: Order) => {
    const params = new URLSearchParams({
      orderId: order.orderId,
      phone: order.phone,
    });
    router.push(`/admin/orders?${params.toString()}`);
  }

  const isLoadingData = isUserLoading || isLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Leads</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Leads</CardTitle>
          <CardDescription>
            This is a list of all customers who have placed an order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingData ? (
                <>
                  <LeadsRowSkeleton />
                  <LeadsRowSkeleton />
                  <LeadsRowSkeleton />
                </>
              ) : leads && leads.length > 0 ? (
                leads.map((lead) => (
                  <TableRow key={lead.orderId}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>{lead.orderId}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="secondary">{lead.items.length} item(s)</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <ul className="list-disc pl-4">
                                {lead.items.map(item => (
                                    <li key={`${item.productId}-${item.size}`}>{item.name} ({item.size}) x {item.quantity}</li>
                                ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Select defaultValue={lead.status} onValueChange={(value) => handleStatusChange(lead.orderId, value as Order['status'])}>
                          <SelectTrigger className="w-[120px] h-8 text-xs">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Confirmed">Confirmed</SelectItem>
                              <SelectItem value="Packed">Packed</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
                              <SelectItem value="Delivered">Delivered</SelectItem>
                          </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleTrackOrder(lead)}>Track Order</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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
