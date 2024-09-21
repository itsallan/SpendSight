# SpendSight

SpendSight is a Next.js and TypeScript application that allows users to upload receipts, extract key details using the OpenAI API, and track their spending. It uses Supabase for authentication, storage, and database management.

## Features

- **Receipt Upload**: Users can upload receipt images.
- **AI-Powered Extraction**: OpenAI extracts details from receipts, such as items purchased and total amount.
- **Data Storage**: Extracted data is stored in the Supabase database.
- **User Dashboard**: Users can view their receipts and spending trends through graphs.
- **CSV Export**: Users can export a CSV file of their receipts and related data.

## Technologies

- **Next.js**: For building the frontend.
- **TypeScript**: For type safety and better development experience.
- **Supabase**: Authentication, storage (bucket), and database.
- **OpenAI API**: For extracting details from uploaded receipt images.

## How It Works

1. A user uploads an image of their receipt.
2. The OpenAI API extracts the details (items, total amount, etc.) from the receipt.
3. These details are saved in the Supabase database.
4. The user's dashboard displays the receipt details and visualizes financial data (spending trends, graphs, etc.).
5. Users can export their data as a CSV file for further use.

## Database Schema

### Receipts Table

```sql
CREATE TABLE receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  merchant VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
