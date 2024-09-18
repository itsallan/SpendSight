'use client';

import { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Dashboard from '@/components/DashBoard';
import Auth from '@/components/Auth';
import { Toaster } from "@/components/ui/toaster"

export default function ClientHome() {
  const session = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [session]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="w-full">
      {session ? (
        <Dashboard user={session.user} />
      ) : (
        <Auth />
      )}
      <Toaster />
    </div>
  );
}