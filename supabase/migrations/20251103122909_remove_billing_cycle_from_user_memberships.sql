/*
  # Remove Billing Cycle from User Memberships

  1. Changes
    - Drop billing_cycle column from user_memberships table as it's no longer needed
    - All memberships now grant 1 year of membership
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_memberships' AND column_name = 'billing_cycle'
  ) THEN
    ALTER TABLE user_memberships DROP COLUMN billing_cycle;
  END IF;
END $$;