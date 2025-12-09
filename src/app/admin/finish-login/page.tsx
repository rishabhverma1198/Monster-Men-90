
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


export default function FinishLoginPage() {
    const router = useRouter();
    const auth = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!auth) {
            // Wait for auth to be initialized
            return;
        }

        const url = window.location.href;
        if (isSignInWithEmailLink(auth, url)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                // User opened the link on a different device. To prevent session fixation
                // attacks, ask the user to provide the email again. For simplicity,
                // we'll show an error, but a production app would have a form here.
                setError("Login failed. Please try sending the login link again from the same device.");
                setStatus('error');
                return;
            }

            signInWithEmailLink(auth, email, url)
                .then(() => {
                    window.localStorage.removeItem('emailForSignIn');
                    setStatus('success');
                    router.push('/admin');
                })
                .catch((err) => {
                    console.error(err);
                    setError("Failed to sign in. The link may have expired or been used already.");
                    setStatus('error');
                });
        } else {
             setError("Invalid login link.");
             setStatus('error');
        }

    }, [auth, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Finalizing Login</CardTitle>
                    <CardDescription>Please wait while we securely sign you in.</CardDescription>
                </CardHeader>
                <CardContent>
                    {status === 'loading' && (
                        <div className="flex flex-col items-center justify-center gap-4 p-8">
                            <Loader2 className="h-12 w-12 animate-spin text-accent" />
                            <p className="text-muted-foreground">Verifying your login link...</p>
                        </div>
                    )}
                     {status === 'error' && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Login Error</AlertTitle>
                            <AlertDescription>
                                {error || "An unknown error occurred."}
                                <br />
                                Please return to the login page and try again.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    