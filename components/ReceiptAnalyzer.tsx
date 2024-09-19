'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import { useUser } from '@supabase/auth-helpers-react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ReceiptIcon, Image as ImageIcon, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface StructuredReceipt {
  items: { name: string; price: string }[];
  location: string;
  summary: string;
  machcat?: string;
  total: string | number;
  date: string;
}

function cleanJsonString(str: string): string {
  return str.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
}

function isPostgrestError(error: any): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

export default function ReceiptAnalyzer() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [structuredOutput, setStructuredOutput] = useState<StructuredReceipt | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { messages, append, isLoading } = useChat({
    api: '/api/use-chat-vision',
  });
  const user = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(`receipt-${Date.now()}.jpg`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(data.path);

      setImageUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProcessReceipt = async () => {
    if (!imageUrl) {
      toast({
        title: "No Image",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    try {
      await append({
        content: `Please analyze this receipt and provide the following information in JSON format:
        1. A list of items purchased with their prices
        2. The location where the purchase was made (merchant name)
        3. A short summary about the receipt
        4. If there's a MERCHCANT code, please include it
        5. Calculate and include the total for all the purchased items
        6. The date of the purchase

        Format the response as a JSON object with keys: items (an array of objects with name and price), location, summary, machcat (if present), total, and date.`,
        role: 'user',
      }, {
        data: { imageUrl },
      });
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveReceiptToDatabase = async (receipt: StructuredReceipt) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save receipts.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const totalAmount = typeof receipt.total === 'string' 
        ? parseFloat(receipt.total.replace('$', ''))
        : receipt.total;

      const receiptData = {
        user_id: user.id,
        merchant: receipt.location,
        date: new Date(receipt.date).toISOString(),
        total_amount: totalAmount,
        items: receipt.items,
      };

      const { data, error } = await supabase
        .from('receipts')
        .insert(receiptData)
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Receipt saved successfully!",
      });

      // Navigate back to the main dashboard after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500); // 1.5 seconds delay to allow the user to see the success message
    } catch (error) {
      console.error('Error saving receipt:', error);
      let errorMessage = 'An unexpected error occurred';
      if (isPostgrestError(error)) {
        errorMessage = `Supabase error: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Save Failed",
        description: `Failed to save receipt: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        try {
          const cleanedContent = cleanJsonString(lastMessage.content);
          const parsedOutput = JSON.parse(cleanedContent) as StructuredReceipt;
          setStructuredOutput(parsedOutput);
        } catch (error) {
          console.error('Error parsing AI response:', error);
          console.log('Raw AI response:', lastMessage.content);
          toast({
            title: "Parsing Error",
            description: "Failed to parse the analyzed receipt data.",
            variant: "destructive",
          });
        }
      }
    }
  }, [messages, toast]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-[#030303] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left side - Upload section */}
              <div className="w-full md:w-1/3">
                <Card className="bg-[#1c1c1c] border-none">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-4">
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <div className="w-32 h-32 bg-[#252525] rounded-md flex items-center justify-center">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt="Uploaded receipt" 
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <ImageIcon className="w-16 h-16 text-gray-400" />
                          )}
                        </div>
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={handleProcessReceipt}
                        className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white"
                        disabled={!imageUrl || isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Process Receipt'}
                        <ReceiptIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right side - Results section */}
              <div className="w-full md:w-2/3">
                {structuredOutput ? (
                  <Card className="bg-[#1c1c1c] border-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Receipt Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Merchant</p>
                            <p className="text-lg font-semibold">{structuredOutput.location}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Date</p>
                            <p className="text-lg font-semibold">{structuredOutput.date}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Summary</p>
                          <p>{structuredOutput.summary}</p>
                        </div>
                        {structuredOutput.machcat && (
                          <div>
                            <p className="text-sm text-gray-400">MACHCAT</p>
                            <p>{structuredOutput.machcat}</p>
                          </div>
                        )}
                        <Separator className="bg-gray-700" />
                        <div>
                          <p className="text-lg font-semibold mb-2">Items Purchased</p>
                          <ul className="space-y-2">
                            {structuredOutput.items.map((item, index) => (
                              <li key={index} className="flex justify-between">
                                <span>{item.name}</span>
                                <span className="font-semibold">{item.price}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Separator className="bg-gray-700" />
                        <div className="flex justify-between items-center text-xl font-semibold">
                          <span>Total:</span>
                          <span>{structuredOutput.total}</span>
                        </div>
                        <Button
                          onClick={() => saveReceiptToDatabase(structuredOutput)}
                          className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white"
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save Receipt'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Upload and process a receipt to see the analysis results here.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}