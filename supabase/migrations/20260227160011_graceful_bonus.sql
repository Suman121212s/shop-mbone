/*
  # Create User Profile and Related Tables

  1. New Tables
    - `user_profiles`
      - Complete user profile with address fields
      - Wallet and blockchain information
    
    - `liked_items`
      - User's liked/favorite products
    
    - `notifications`
      - User notifications system

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  mobile_no text DEFAULT '',
  address_1 text DEFAULT '',
  address_2 text DEFAULT '',
  address_3 text DEFAULT '',
  address_4 text DEFAULT '',
  address_5 text DEFAULT '',
  pincode text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  country text DEFAULT '',
  flat_building_no text DEFAULT '',
  nearest_location text DEFAULT '',
  wallet_balance numeric DEFAULT 0,
  blockchain_name text DEFAULT 'Polygon',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Liked Items Table
CREATE TABLE IF NOT EXISTS liked_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  heading text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE liked_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view and edit their own profile"
  ON user_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Liked Items Policies
CREATE POLICY "Users can manage their own liked items"
  ON liked_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert sample notifications for testing
INSERT INTO notifications (user_id, heading, message, link) 
SELECT 
  auth.uid(),
  'Welcome to ModernMart!',
  'Thank you for joining us. Explore our latest products and exclusive deals.',
  '/products'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;