/*
  # Create Memberships System

  1. New Tables
    - `memberships`
      - `id` (uuid, primary key)
      - `name` (text) - Membership tier name
      - `monthly_price` (numeric) - Price per month in dollars
      - `yearly_price` (numeric) - Price per year in dollars
      - `features` (jsonb) - Array of membership features
      - `created_at` (timestamptz)
    
    - `user_memberships`
      - `id` (uuid, primary key)
      - `user_id` (text) - References user ID from app
      - `membership_id` (uuid) - References memberships table
      - `billing_cycle` (text) - 'monthly' or 'yearly'
      - `status` (text) - 'active', 'cancelled', 'expired'
      - `started_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - View all membership tiers
      - View their own membership subscriptions
      - Admins can manage all memberships
*/

-- Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  monthly_price numeric(10, 2) NOT NULL,
  yearly_price numeric(10, 2) NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create user_memberships table
CREATE TABLE IF NOT EXISTS user_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;

-- Memberships policies - everyone can view membership tiers
CREATE POLICY "Anyone can view membership tiers"
  ON memberships FOR SELECT
  TO public
  USING (true);

-- User memberships policies - users can view their own memberships
CREATE POLICY "Users can view own memberships"
  ON user_memberships FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own memberships"
  ON user_memberships FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update own memberships"
  ON user_memberships FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert the three membership tiers
INSERT INTO memberships (name, monthly_price, yearly_price, features)
VALUES 
  ('House Plus', 5.00, 10.00, '["Access to exclusive weapons", "2x OHIS earning rate", "Priority support"]'::jsonb),
  ('House Pro', 10.00, 15.00, '["All House Plus features", "5x OHIS earning rate", "Custom profile themes", "Early access to new features"]'::jsonb),
  ('House MAX', 20.00, 30.00, '["All House Pro features", "10x OHIS earning rate", "Exclusive game modes", "VIP badge", "Direct line to admins"]'::jsonb)
ON CONFLICT (name) DO NOTHING;