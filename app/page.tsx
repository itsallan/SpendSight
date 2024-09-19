import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();


  if (session) {
    redirect('/dashboard');
  } else {
    console.log('Redirecting to auth');
    redirect('/auth');
  }

  return null;
}