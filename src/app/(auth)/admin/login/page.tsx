
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package2, Loader2, Terminal, MailCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail, sendSignInLinkToEmail, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


export default function AdminLoginPage() {
    const [email, setEmail] = useState("admin.monsermens90@gmail.com");
    const [password, setPassword] = useState("password123");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const auth = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const notAdminError = searchParams.get('error') === 'not-admin';
    
    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        clearMessages();

        if (!auth) {
            setError("Authentication service not available.");
            setIsLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/admin");
        } catch (err: any) {
             if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                // User doesn't exist, so create them
                console.log("User not found, attempting to create a new user...");
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    console.log("User created successfully. Redirecting to admin...");
                    // The AdminLayout will handle adding them to the 'admins' collection.
                    router.push("/admin");
                } catch (creationError: any) {
                    handleAuthError(creationError);
                }
            } else {
                handleAuthError(err);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleSendLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        clearMessages();

        if (!auth) {
            setError("Authentication service not available.");
            setIsLoading(false);
            return;
        }

        const actionCodeSettings = {
            url: `${window.location.origin}/admin/finish-login`,
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setSuccessMessage("A login link has been sent to your email address.");
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email address to reset your password.");
            return;
        }
        setIsLoading(true);
        clearMessages();
        
        if (!auth) {
            setError("Authentication service not available.");
            setIsLoading(false);
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage("A password reset link has been sent to your email.");
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleAuthError = (err: any) => {
        console.error("Login/Signup Error: ", err); // Added for debugging
        switch(err.code) {
            case "auth/user-not-found":
            case "auth/wrong-password":
            case "auth/invalid-credential":
                setError("Invalid email or password.");
                break;
            case "auth/invalid-email":
                setError("Please enter a valid email address.");
                break;
            case "auth/email-already-in-use":
                setError("This email is already in use. Please try logging in or reset your password.");
                break;
            default:
                setError(`An unexpected error occurred: ${err.message}. Please try again.`);
                break;
        }
    }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
            <Link href="/" className="inline-block mb-4">
                <Package2 className="h-10 w-10 text-accent" />
            </Link>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Sign in to access the dashboard.
          </p>
        </div>
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password" onClick={clearMessages}>Password</TabsTrigger>
            <TabsTrigger value="email-link" onClick={clearMessages}>Email Link</TabsTrigger>
          </TabsList>
          <TabsContent value="password">
            <Card>
                <CardHeader>
                    <CardTitle>Sign in with Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="default" className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800 dark:text-blue-300">How to Login</AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-400">
                            Use email: <strong>admin.monsermens90@gmail.com</strong> and password: <strong>password123</strong>. If the user doesn't exist, it will be automatically created for you on the first login attempt.
                        </AlertDescription>
                    </Alert>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {notAdminError && !error && (
                            <Alert variant="destructive">
                                <Terminal className="h-4 w-4" />
                                <AlertTitle>Access Denied</AlertTitle>
                                <AlertDescription>You do not have permission to access the admin panel. Make sure your UID is in the 'admins' collection.</AlertDescription>
                            </Alert>
                        )}
                        {error && (
                            <Alert variant="destructive">
                                <Terminal className="h-4 w-4" />
                                <AlertTitle>Login Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                         {successMessage && (
                            <Alert variant="default" className="bg-green-100 dark:bg-green-900/20">
                                <MailCheck className="h-4 w-4" />
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email-password">Email</Label>
                            <Input id="email-password" type="email" placeholder="admin.monsermens90@gmail.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                        </div>
                        <div className="space-y-2 relative">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type={showPassword ? "text" : "password"} 
                                required value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                disabled={isLoading} 
                                className="pr-10"
                            />
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-1 top-7 h-7 w-7" 
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <Button variant="link" type="button" onClick={handleForgotPassword} className="p-0 text-sm h-auto" disabled={isLoading}>
                                Forgot password?
                            </Button>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In / Sign Up
                        </Button>
                    </form>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="email-link">
             <Card>
                <CardHeader>
                    <CardTitle>Sign in with Email</CardTitle>
                    <CardDescription>We'll send a magic link to your email address.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSendLink} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <Terminal className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {successMessage && (
                            <Alert variant="default" className="bg-green-100 dark:bg-green-900/20">
                                <MailCheck className="h-4 w-4" />
                                <AlertTitle>Check Your Email</AlertTitle>
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email-link">Email</Label>
                            <Input id="email-link" type="email" placeholder="admin.monsermens90@gmail.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading || !!successMessage} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || !!successMessage}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Login Link
                        </Button>
                    </form>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

    