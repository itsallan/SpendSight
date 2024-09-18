'use client';

import React from 'react';
import { User } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import TopBar from './TopBar';

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const receipts = [
  { id: 1, date: '2023-06-01', total: 56.78, store: 'Grocery Store' },
  { id: 2, date: '2023-06-03', total: 23.45, store: 'Gas Station' },
  { id: 3, date: '2023-06-05', total: 89.99, store: 'Electronics Shop' },
];

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar />
      <div className="flex-grow w-full p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <Card className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-2xl font-bold">Welcome, {user.user_metadata.username || user.email}!</CardTitle>
                <CardDescription className="text-muted-foreground">
                  This is your personalized dashboard for receipt analysis.
                </CardDescription>
              </div>
              <Button onClick={() => router.push('/receipt-analyzer')}>
                Add New Receipt
              </Button>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spending Overview</CardTitle>
              <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 0,
                    left: 0,
                    bottom: 0,
                  }}
                  height={300}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing total spending for the last 6 months
              </div>
            </CardFooter>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Recent Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {receipts.map((receipt) => (
                  <li key={receipt.id} className="flex justify-between items-center p-2 bg-secondary rounded-md">
                    <span>{receipt.date} - {receipt.store}</span>
                    <span className="font-semibold">${receipt.total.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}