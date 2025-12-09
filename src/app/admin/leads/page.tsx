
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
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Leads</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Leads</CardTitle>
          <CardDescription>
            This page is currently disabled. Listing all customers at once is not permitted by security rules to ensure application performance and security.
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
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Lead functionality is disabled.
                  </TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
