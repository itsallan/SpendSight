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
```
### Profiles Table
```sql
Copy code
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
### Security Policies
To ensure user privacy, we have set up row-level security policies that restrict access to only the user’s data:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```
  
### Set Up Storage
To store receipts, you'll need to create a storage bucket in Supabase:

1. Open the Supabase dashboard.
2. Create a bucket and name it receipts.

### Requirements
Before setting up the project, make sure you have:

- Node.js (v14 or higher)
- A Supabase account
An OpenAI API key

### Installation
1. Clone this repository:

```bash
git clone https://github.com/your-username/spendsight.git
cd spendsight
```
2. Install the necessary packages:

```bash
npm install
```
3. Set up your environment variables. Create a `.env.local` file and add your Supabase and OpenAI credentials:

```javascript
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```
4. Start the development server:
```bash
npm run dev
```
Now, visit http://localhost:3000 to start using SpendSight.

### Contributing to SpendSight
Thinking about contributing? Awesome! Here's what you need to do:

1. Fork this repository.
2. Create a new branch for your feature or fix.
3. Make your changes.
4. Submit a pull request, and we'll review it.
5. Supabase Setup
6. Make sure to configure Supabase for user authentication, storage, and database management:

### Set up a new project in Supabase.
Create a bucket called receipts.
Run the SQL scripts for the `receipts` and `profiles` tables provided earlier.
### How to Use SpendSight
1. Upload Receipts: After signing up or logging in, start by uploading your receipts.
2. AI Data Extraction: Watch as OpenAI works its magic by extracting key details.
3. Track Spending: View the extracted details in your personalized dashboard.
4. Export as CSV: Want a downloadable record? Export your receipt data in CSV format with one click.
