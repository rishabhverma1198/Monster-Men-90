"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
            <Link href="/" className="inline-block mb-4">
                <Package2 className="h-10 w-10 text-accent" />
            </Link>
          <h1 className="text-3xl font-bold">Admin Panel Login</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access the dashboard.
          </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                    </div>
                </div>
                <Link href="/admin">
                    <Button type="submit" className="w-full mt-6">
                        Login
                    </Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
