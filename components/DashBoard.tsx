'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { DollarSign, ShoppingCart, Activity } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/app/lib/supabase';

interface Receipt {
  id: string;
  date: string;
  total_amount: number;
  merchant: string;
}

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const { data, error } = await supabase
          .from('receipts')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);

        if (error) throw error;

        setReceipts(data || []);
      } catch (error) {
        console.error('Error fetching receipts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipts();
  }, [user.id]);

  const totalSpent = receipts.reduce((sum, receipt) => sum + receipt.total_amount, 0);

  const chartData = receipts.map(receipt => ({
    date: new Date(receipt.date).toLocaleDateString(),
    amount: receipt.total_amount
  }));

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Button onClick={() => router.push('/receipt-analyzer')} variant="outline" size="lg">
            Add New Receipt
          </Button>
        </div>

        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="bg-gray-900">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Card className="bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Total Spent</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalSpent.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Receipts</CardTitle>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{receipts.length}</div>
              <p className="text-sm text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Avg. Spend</CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${(totalSpent / (receipts.length || 1)).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-gray-900">
            <CardHeader>
              <CardTitle className="text-xl">Spending Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: 'none' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-900">
            <CardHeader>
              <CardTitle className="text-xl">Recent Receipts</CardTitle>
              <p className="text-sm text-muted-foreground">
                You have {receipts.length} receipt{receipts.length !== 1 ? 's' : ''} this month.
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading receipts...</p>
              ) : receipts.length === 0 ? (
                <p>No receipts found. Start by adding a new receipt!</p>
              ) : (
                <ul className="space-y-4">
                  {receipts.map((receipt) => (
                    <li key={receipt.id} className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <div>
                        <p className="font-medium">{receipt.merchant}</p>
                        <p className="text-sm text-muted-foreground">{new Date(receipt.date).toLocaleDateString()}</p>
                      </div>
                      <p className="font-medium text-lg">${receipt.total_amount.toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}