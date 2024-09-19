import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import DashboardContent from './DashBoardContent';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.log('No session found, redirecting to auth');
      redirect('/auth');
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent user={session.user} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error in dashboard page:', error);
    redirect('/auth');
  }
}