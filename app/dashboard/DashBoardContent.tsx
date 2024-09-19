'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { DollarSign, ShoppingCart, Activity, LogOut, Download, Github } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/app/lib/supabase';

interface Receipt {
  id: string;
  date: string;
  total_amount: number;
  merchant: string;
  items: { name: string; price: number }[];
}

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const { data, error } = await supabase
          .from('receipts')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

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

  const chartData = receipts.slice(0, 10).map(receipt => ({
    date: new Date(receipt.date).toLocaleDateString(),
    amount: receipt.total_amount
  }));

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const exportToCSV = async () => {
    try {
      setIsExporting(true);
      let csvContent = 'Date,Merchant,Item,Price,Total Amount\n';

      receipts.forEach(receipt => {
        const receiptDate = new Date(receipt.date).toLocaleDateString();
        if (receipt.items && receipt.items.length > 0) {
          receipt.items.forEach((item, index) => {
            csvContent += `${receiptDate},${receipt.merchant},${item.name},${item.price.toFixed(2)}`;
            if (index === 0) {
              csvContent += `,${receipt.total_amount.toFixed(2)}`;
            }
            csvContent += '\n';
          });
        } else {
          csvContent += `${receiptDate},${receipt.merchant},No items,0.00,${receipt.total_amount.toFixed(2)}\n`;
        }
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'receipts_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Welcome, {user.user_metadata.full_name || user.email}</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => router.push('/receipt-analyzer')} variant="outline" size="lg">
              Add New Receipt
            </Button>
            <Button onClick={handleLogout} variant="destructive" size="lg">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="bg-gray-900">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${totalSpent.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">Receipts</CardTitle>
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{receipts.length}</div>
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
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-xl">Spending Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {chartData.length > 0 ? (
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
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p>No data available for chart</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Receipts</CardTitle>
                  <CardDescription>
                    You have {receipts.length} receipt{receipts.length !== 1 ? 's' : ''} in total.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Loading receipts...</p>
                  ) : receipts.length === 0 ? (
                    <p>No receipts found. Start by adding a new receipt!</p>
                  ) : (
                    <ul className="space-y-4">
                      {receipts.slice(0, 5).map((receipt) => (
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
          </TabsContent>
          <TabsContent value="reports">
            <Card className="bg-gray-900">
              <CardHeader>
                <CardTitle className="text-xl">Export Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Download your receipt data in CSV format, including individual items for each receipt.</p>
                <Button onClick={exportToCSV} disabled={isExporting}>
                  {isExporting ? 'Exporting...' : (
                    <>
                      <Download className="mr-2 h-4 w-4" /> Export to CSV
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* GitHub Link */}
        <div className="mt-8 text-center">
          <a 
            href="https://github.com/itsallan/SpendSight" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-500 hover:text-blue-600"
          >
            <Github className="mr-2 h-4 w-4" />
            View this project on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}