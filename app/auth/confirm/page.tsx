'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ConfirmationPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const checkConfirmationStatus = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (user && user.email_confirmed_at) {
        setIsConfirmed(true);
        toast({
          title: "Email Confirmed",
          description: "Your email has been confirmed. Redirecting to dashboard...",
        });
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000); // Redirect after 3 seconds
      } else {
        setIsConfirmed(false);
        if (user) {
          toast({
            title: "Email Not Confirmed",
            description: "Please check your email and click the confirmation link.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error checking confirmation status:', error);
      toast({
        title: "Error",
        description: "Failed to check confirmation status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConfirmationStatus();
    
    // Set up a periodic check
    const interval = setInterval(checkConfirmationStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleManualCheck = async () => {
    await checkConfirmationStatus();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Card className="w-[350px]">
          <CardContent className="pt-6">
            <p>Checking confirmation status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{isConfirmed ? "Email Confirmed!" : "Check Your Email"}</CardTitle>
          <CardDescription>
            {isConfirmed 
              ? "Your email has been confirmed. Redirecting to dashboard..." 
              : "We've sent you a confirmation link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConfirmed ? (
            <p>You'll be redirected to the dashboard shortly.</p>
          ) : (
            <>
              <p className="mb-4">Please check your email and click on the confirmation link to activate your account.</p>
              <Button onClick={handleManualCheck} className="w-full">
                I've confirmed my email
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}