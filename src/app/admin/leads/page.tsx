
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Dummy Data for Leads
const DUMMY_LEADS = [
    { name: "Ravi Kumar", phone: "+91 9876543210", orders: 2, totalSpent: 250.75, status: "Contacted" },
    { name: "Priya Sharma", phone: "+91 9876543211", orders: 1, totalSpent: 89.99, status: "New" },
    { name: "Amit Singh", phone: "+91 9876543212", orders: 5, totalSpent: 750.00, status: "Contacted" },
    { name: "Sunita Devi", phone: "+91 9876543213", orders: 1, totalSpent: 120.50, status: "Blacklisted" },
    { name: "Vikram Rathore", phone: "+91 9876543214", orders: 3, totalSpent: 310.20, status: "New" },
];


export default function LeadsPage() {

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Leads</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Leads</CardTitle>
          <CardDescription>
            Showing dummy customer leads. Live data is currently bypassed.
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
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {DUMMY_LEADS.map((lead, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell className="text-center">{lead.orders}</TableCell>
                        <TableCell className="text-right">${lead.totalSpent.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={
                                lead.status === 'Contacted' ? 'secondary' : 
                                lead.status === 'New' ? 'default' : 'destructive'
                            }>{lead.status}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                                <Button variant="outline" size="sm">Contact</Button>
                                <Button variant="destructive" size="sm">Blacklist</Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
