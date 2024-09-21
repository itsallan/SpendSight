'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { AuthError } from '@supabase/supabase-js';

export default function AuthPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/dashboard');
            } else {
                setIsLoading(false);
            }
        };

        checkSession();
    }, [supabase, router]);

    const handleError = (error: unknown, action: string) => {
        console.error(`Error ${action}:`, error);
        let errorMessage = "An unexpected error occurred";
        
        if (error instanceof AuthError) {
            errorMessage = error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        toast({
            title: `${action} Failed`,
            description: errorMessage,
            variant: "destructive",
        });
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });

            if (error) throw error;

            toast({
                title: "Sign Up Successful",
                description: "Please check your email to confirm your account.",
            });

            router.push('/dashboard');
        } catch (error) {
            handleError(error, "Sign Up");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;

            toast({
                title: "Sign In Successful",
                description: "Welcome back!",
            });

            router.push('/dashboard');
        } catch (error) {
            handleError(error, "Sign In");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-background">Loading...</div>;
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>{isSignUp ? "Create an Account" : "Sign In"}</CardTitle>
                    <CardDescription>
                        {isSignUp ? "Sign up for a new account" : "Sign in to your account"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
                        <div className="space-y-4">
                            {isSignUp && (
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="Full Name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Button
                        onClick={isSignUp ? handleSignUp : handleSignIn}
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </Button>
                    <Button
                        variant="link"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="w-full"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}