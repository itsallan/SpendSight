'use client';

import { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Dashboard from '@/app/dashboard/DashBoardContent';
import Auth from '@/components/Auth';
import { Toaster } from "@/components/ui/toaster"

export default function ClientHome() {
  const session = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [session]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black">
      {session ? (
        <Dashboard user={session.user} />
      ) : (
        <Auth />
      )}
      <Toaster />
    </div>
  );
}