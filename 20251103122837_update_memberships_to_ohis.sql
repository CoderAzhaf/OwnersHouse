/*
  # Update Memberships to Use OHIS Currency

  1. Changes
    - Replace monthly_price and yearly_price columns with single ohis_price column
    - Update all membership tier pricing to OHIS values
    - House Plus: 500 Million OHIS
    - House Pro: 500 Billion OHIS
    - House MAX: 500 Trillion OHIS

  2. Data Migration
    - Remove old price columns
    - Add new ohis_price column
    - Update all membership tiers with new OHIS pricing
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memberships' AND column_name = 'monthly_price'
  ) THEN
    ALTER TABLE memberships DROP COLUMN monthly_price;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memberships' AND column_name = 'yearly_price'
  ) THEN
    ALTER TABLE memberships DROP COLUMN yearly_price;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memberships' AND column_name = 'ohis_price'
  ) THEN
    ALTER TABLE memberships ADD COLUMN ohis_price numeric(20, 0) NOT NULL DEFAULT 0;
  END IF;
END $$;

UPDATE memberships SET ohis_price = 500000000 WHERE name = 'House Plus';
UPDATE memberships SET ohis_price = 500000000000 WHERE name = 'House Pro';
UPDATE memberships SET ohis_price = 500000000000000 WHERE name = 'House MAX';