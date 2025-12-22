# Quick Start Guide - Wallet & Stripe Integration

## ✅ What You Just Set Up

Your `/wallet` page is now connected to:
- Real Stripe payment processing
- Real Rip balance tracking
- Real transaction history

## 🚀 Setup Steps

### 1. Set Up Database in Supabase

Go to your Supabase project → SQL Editor and run this:

```sql
-- ============================================================================
-- RIPS BALANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rip_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_purchased DECIMAL(10, 2) NOT NULL DEFAULT 0,
  lifetime_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_rip_balances_user_id ON rip_balances(user_id);

ALTER TABLE rip_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balance"
  ON rip_balances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage balances"
  ON rip_balances FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RIP BUNDLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rip_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  rips INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  price_usd DECIMAL(10, 2) GENERATED ALWAYS AS (price_cents / 100.0) STORED,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  stripe_price_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial bundles
INSERT INTO rip_bundles (name, rips, price_cents, discount_percent, sort_order) VALUES
  ('5 Rips', 5, 500, 0, 1),
  ('10 Rips', 10, 900, 10, 2),
  ('25 Rips', 25, 2200, 12, 3),
  ('50 Rips', 50, 4000, 20, 4)
ON CONFLICT DO NOTHING;

ALTER TABLE rip_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active bundles"
  ON rip_bundles FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rip_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (type IN ('purchase', 'pack_open', 'card_sellback', 'admin_adjustment', 'refund'))
);

CREATE INDEX idx_rip_transactions_user_id ON rip_transactions(user_id);
CREATE INDEX idx_rip_transactions_created_at ON rip_transactions(created_at DESC);

ALTER TABLE rip_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON rip_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- STRIPE PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS stripe_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_checkout_session_id VARCHAR(255),
  bundle_id UUID REFERENCES rip_bundles(id),
  amount_cents INTEGER NOT NULL,
  rips_purchased INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded'))
);

CREATE INDEX idx_stripe_payments_user_id ON stripe_payments(user_id);
CREATE INDEX idx_stripe_payments_intent_id ON stripe_payments(stripe_payment_intent_id);

ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON stripe_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Get user's Rip balance
CREATE OR REPLACE FUNCTION get_user_rip_balance(p_user_id UUID)
RETURNS DECIMAL(10, 2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance DECIMAL(10, 2);
BEGIN
  SELECT balance INTO v_balance
  FROM rip_balances
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_balance, 0);
END;
$$;

-- Add Rips (after successful payment)
CREATE OR REPLACE FUNCTION add_rips(
  p_user_id UUID,
  p_amount DECIMAL(10, 2),
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance DECIMAL(10, 2);
  v_transaction_id UUID;
BEGIN
  -- Insert or update balance
  INSERT INTO rip_balances (user_id, balance, lifetime_purchased, updated_at)
  VALUES (p_user_id, p_amount, p_amount, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = rip_balances.balance + p_amount,
    lifetime_purchased = rip_balances.lifetime_purchased + p_amount,
    updated_at = NOW()
  RETURNING balance INTO v_new_balance;

  -- Record transaction
  INSERT INTO rip_transactions (user_id, type, amount, balance_after, metadata)
  VALUES (p_user_id, 'purchase', p_amount, v_new_balance, p_metadata)
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'balance', v_new_balance,
    'transaction_id', v_transaction_id
  );
END;
$$;

-- Spend Rips (for pack opening)
CREATE OR REPLACE FUNCTION spend_rips(
  p_user_id UUID,
  p_amount DECIMAL(10, 2),
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance DECIMAL(10, 2);
  v_new_balance DECIMAL(10, 2);
  v_transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM rip_balances
  WHERE user_id = p_user_id;

  -- Check if sufficient balance
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient Rips balance'
    );
  END IF;

  -- Deduct balance
  UPDATE rip_balances
  SET
    balance = balance - p_amount,
    lifetime_spent = lifetime_spent + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  -- Record transaction
  INSERT INTO rip_transactions (user_id, type, amount, balance_after, metadata)
  VALUES (p_user_id, 'pack_open', -p_amount, v_new_balance, p_metadata)
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'balance', v_new_balance,
    'transaction_id', v_transaction_id
  );
END;
$$;
```

### 2. Configure Environment Variables

Make sure your `.env` has these variables:

```bash
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # CRITICAL - Keep secret!

# Stripe
STRIPE_SECRET_KEY=sk_test_...
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Get this after setting up webhook
```

### 3. Set Up Stripe Webhook

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Add your URL: `https://yourdomain.com/api/stripe/webhook`
   - For local testing: Use ngrok or Stripe CLI
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the "Signing secret" (starts with `whsec_`)
6. Add it to your `.env` as `STRIPE_WEBHOOK_SECRET`

### 4. Test It Out!

1. Start your dev server: `npm run dev`
2. Go to http://localhost:5173/wallet
3. Click on any Rip bundle
4. Complete test payment with Stripe test card: `4242 4242 4242 4242`
5. After payment, you should be redirected back and see your new balance!

## 🔍 How It Works

1. **User clicks "Buy Rips"** → Creates Stripe Checkout session
2. **User completes payment** → Stripe webhook fires
3. **Webhook receives payment** → Calls `add_rips()` function
4. **Database updates** → Balance + transaction recorded
5. **User sees new balance** → Ready to open packs!

## 🐛 Troubleshooting

### Webhook not working?
- Check Stripe Dashboard → Webhooks → View events
- Make sure `STRIPE_WEBHOOK_SECRET` is correct
- For local testing, use Stripe CLI: `stripe listen --forward-to localhost:5173/api/stripe/webhook`

### No bundles showing?
- Run the SQL script above to seed bundles
- Check Supabase → Table Editor → `rip_bundles`

### Balance not updating?
- Check Supabase → Logs
- Check browser console for errors
- Verify webhook is receiving events

## 📚 More Info

For complete implementation details, see `STRIPE_IMPLEMENTATION.md`

## Need Help?

Check the webhook logs in Stripe Dashboard and Supabase Logs to debug issues.
