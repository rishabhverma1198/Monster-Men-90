import { placeholderOrders } from "@/lib/placeholder-data";
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
import { Users, Phone, Ban, CheckCircle } from "lucide-react";
import type { Order } from "@/lib/types";

// In a real app, this data would be derived and aggregated from the orders collection.
const getLeadsFromOrders = (orders: Order[]) => {
  const leadsMap = new Map<string, { name: string; phone: string; orderIds: string[]; totalSpent: number }>();

  orders.forEach(order => {
    const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (leadsMap.has(order.phone)) {
      const existingLead = leadsMap.get(order.phone)!;
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

  return Array.from(leadsMap.values());
};

export default function LeadsPage() {
  const leads = getLeadsFromOrders(placeholderOrders);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Users className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold">Handle Leads</h1>
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
              {leads.length > 0 ? (
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
