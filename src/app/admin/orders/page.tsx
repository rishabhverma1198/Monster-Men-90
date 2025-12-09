
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, doc, updateDoc, Timestamp, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const STATUS_CLASSES: Record<Order['status'], string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  Packed: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Shipped: "bg-purple-100 text-purple-800 border-purple-200",
  Delivered: "bg-green-100 text-green-800 border-green-200",
};

function OrderRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><div className="flex flex-col gap-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-28" /></div></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell className="text-center"><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
            <TableCell className="text-center"><Skeleton className="h-8 w-[120px] mx-auto" /></TableCell>
        </TableRow>
    )
}

export default function OrdersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const ordersQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'orders_leads'), orderBy('createdAt', 'desc')) : null),
    [firestore, user]
  );
  
  const { data: orders, isLoading } = useCollection<Order & { createdAt: Timestamp }>(ordersQuery);

  const getTotalOrderValue = (order: Order) => {
    return order.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    if (!firestore || !user) return;
    const orderRef = doc(firestore, 'orders_leads', orderId);
    const updatedData = { status: newStatus };
    
    updateDoc(orderRef, updatedData)
        .then(() => {
            toast({
                title: "Status Updated",
                description: `Order ${orderId} is now ${newStatus}.`,
            });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: orderRef.path,
                operation: 'update',
                requestResourceData: updatedData
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }

  const dataLoading = isLoading || isUserLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Orders</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            View and manage all customer orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataLoading ? (
                <>
                  <OrderRowSkeleton />
                  <OrderRowSkeleton />
                  <OrderRowSkeleton />
                  <OrderRowSkeleton />
                  <OrderRowSkeleton />
                </>
              ): orders && orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>
                        <div className="font-medium">{order.name}</div>
                        <div className="text-sm text-muted-foreground">{order.phone}</div>
                    </TableCell>
                    <TableCell>{order.createdAt ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-center">{order.items.length}</TableCell>
                    <TableCell className="text-right">${getTotalOrderValue(order).toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Select defaultValue={order.status} onValueChange={(value) => handleStatusChange(order.orderId, value as Order['status'])}>
                        <SelectTrigger className={`w-[120px] text-xs h-8 ${STATUS_CLASSES[order.status]}`}>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(STATUS_CLASSES).map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No orders found.
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
