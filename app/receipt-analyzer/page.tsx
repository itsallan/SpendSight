'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TopBar from '@/components/TopBar';
import ReceiptAnalyzer from '@/components/ReceiptAnalyzer';

export default function ReceiptAnalyzerPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar />
      <div className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Receipt Analyzer</CardTitle>
              <Button variant="outline" onClick={() => router.push('/')}>
                Back to Dashboard
              </Button>
            </CardHeader>
            <CardContent>
              <ReceiptAnalyzer />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}