import React from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from "@/components/ui/button";
import { Github } from 'lucide-react';

export default function TopBar() {
  const supabase = useSupabaseClient();

  return (
    <div className="w-full bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="text-lg font-semibold text-foreground">SpendSight</div>
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/itsallan/spendsight" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary"
            >
              <Github size={24} />
            </a>
            <Button 
              variant="outline" 
              onClick={() => supabase.auth.signOut()}
            >
              Log out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}