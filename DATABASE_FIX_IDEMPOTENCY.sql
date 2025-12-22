-- ============================================================================
-- FIX: Add Idempotency to Prevent Double-Crediting
-- ============================================================================
-- Run this SQL in Supabase to add database-level duplicate prevention

-- Add unique constraint on stripe_checkout_session_id
-- This prevents the same Stripe session from being processed twice
ALTER TABLE rip_transactions
ADD CONSTRAINT unique_stripe_checkout_session
UNIQUE (
  (metadata->>'stripe_checkout_session_id')
)
WHERE (metadata->>'stripe_checkout_session_id') IS NOT NULL;

-- Add unique constraint on stripe_payment_intent_id for webhook processing
ALTER TABLE rip_transactions
ADD CONSTRAINT unique_stripe_payment_intent
UNIQUE (
  (metadata->>'stripe_payment_intent_id')
)
WHERE (metadata->>'stripe_payment_intent_id') IS NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rip_transactions_checkout_session
ON rip_transactions ((metadata->>'stripe_checkout_session_id'));

CREATE INDEX IF NOT EXISTS idx_rip_transactions_payment_intent
ON rip_transactions ((metadata->>'stripe_payment_intent_id'));

-- ============================================================================
-- This ensures:
-- 1. Each Stripe checkout session can only add Rips ONCE (database enforced)
-- 2. Each Stripe payment intent can only add Rips ONCE (database enforced)
-- 3. Race conditions are impossible - DB will reject duplicates
-- 4. Safe for both success page AND webhook to try adding Rips
-- ============================================================================
