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
import { Upload, ReceiptIcon, Image as ImageIcon } from "lucide-react"
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

  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);

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
        2. The location where the purchase was made (store name)
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
    console.log('saveReceiptToDatabase called with:', receipt);
    if (!user) {
      console.log('No user found');
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save receipts.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      console.log('Attempting to save receipt for user:', user.id);
      
      // Parse the total amount, handling both string and number cases
      const totalAmount = typeof receipt.total === 'string' 
        ? parseFloat(receipt.total.replace('$', ''))
        : receipt.total;

      // Log the data being sent to Supabase
      const receiptData = {
        user_id: user.id,
        merchant: receipt.location,
        date: new Date(receipt.date).toISOString(),
        total_amount: totalAmount,
        items: receipt.items,
      };
      console.log('Data being sent to Supabase:', receiptData);

      const { data, error } = await supabase
        .from('receipts')
        .insert(receiptData)
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Receipt saved successfully:', data);

      toast({
        title: "Success",
        description: "Receipt saved successfully!",
      });

      // Temporarily comment this out for debugging
      // router.push('/');
    } catch (error) {
      console.error('Error saving receipt:', error);
      let errorMessage = 'An unexpected error occurred';
      if (isPostgrestError(error)) {
        errorMessage = `Supabase error: ${error.message}`;
        console.error('Supabase error details:', error.details);
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
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>Receipt Analyzer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-shrink-0">
            <Label htmlFor="image-upload" className="cursor-pointer">
              <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Uploaded receipt" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
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
          </div>
          <div className="flex-grow">
            <Button
              onClick={handleProcessReceipt}
              className="w-full"
              disabled={!imageUrl || isLoading}
            >
              {isLoading ? 'Processing...' : 'Process Receipt'}
              <ReceiptIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        {structuredOutput && (
          <Card className="bg-secondary text-secondary-foreground mt-4">
            <CardHeader>
              <CardTitle>Receipt Analysis</CardTitle>
            </CardHeader>
            <CardContent>
            {structuredOutput.machcat && <p><strong>Merchant:</strong> {structuredOutput.machcat}</p>}
              <p><strong>Location / Store:</strong> {structuredOutput.location}</p>
              <p><strong>Date:</strong> {structuredOutput.date}</p>
              <Separator className="my-4" />
              <h3 className="text-lg font-semibold mb-2">Items Purchased:</h3>
              <ul className="space-y-2">
                {structuredOutput.items.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>{item.price}</span>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <p className="text-lg font-semibold flex justify-between">
                <span>Total:</span>
                <span>{structuredOutput.total}</span>
              </p>

              <p className="text-lg font-semibold flex justify-between">
                <strong>Summary:</strong>
                 {structuredOutput.summary}
                </p>
              <Button
                onClick={() => {
                  console.log('Save button clicked');
                  if (structuredOutput) {
                    console.log('Structured output available:', structuredOutput);
                    saveReceiptToDatabase(structuredOutput);
                  } else {
                    console.log('No structured output available');
                    toast({
                      title: "Error",
                      description: "No receipt data to save.",
                      variant: "destructive",
                    });
                  }
                }}
                className="w-full mt-4"
                disabled={isSaving || !structuredOutput}
              >
                {isSaving ? 'Saving...' : 'Save Receipt'}
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}