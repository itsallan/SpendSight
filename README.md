# SpendSight

Welcome to **SpendSight** – a handy tool designed to help users keep track of their spending by simply uploading receipts. It's built using **Next.js** and **TypeScript**, with **Supabase** handling our backend tasks like authentication, storage, and the database, and **OpenAI** handling the magic of extracting receipt details.

## What SpendSight Does

With SpendSight, you can:

- **Upload Receipts**: Snap a picture or upload a digital receipt.
- **AI-Powered Extraction**: We'll automatically grab important details from the receipt, like items purchased and the total amount spent, thanks to OpenAI.
- **Store Your Data**: All extracted information is saved safely in the Supabase database.
- **Track Your Spending**: You can easily view your past purchases in a visually pleasing dashboard with graphs showing your spending trends.
- **Export CSV**: Want to take your data with you? You can export all your receipts into a CSV file anytime.

## The Tech Stack

- **Next.js**: React framework for building the frontend.
- **TypeScript**: Ensures clean, well-typed code.
- **Supabase**: Used for user authentication, database management, and file storage.
- **OpenAI API**: Extracts all the essential details from your uploaded receipts.

## How It All Works

Here’s a breakdown of the app flow:

1. A user uploads a receipt image.
2. OpenAI analyzes the image and extracts details like merchant name, date, items, and total amount.
3. The extracted data is stored in Supabase for future access.
4. On the user's dashboard, graphs and charts provide insights into spending habits.
5. Users can also download their receipt data as a CSV file.

## Database Schema Overview

SpendSight relies on two main database tables for receipts and user profiles. Here's a quick look:

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
