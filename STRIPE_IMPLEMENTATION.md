# Stripe Integration Guide - Rips System

Complete implementation guide for the Rips (virtual currency) purchase and pack-opening system.

## 🏗️ Architecture Overview

**Currency System:** $1 = 1 Rip (with bundle discounts)
**Pack Price:** 1 Rip per pack
**Sell-back Rate:** 85% (0.85 Rips per $1 card value)
**Max Card Cap:** $250-$500 (adjustable)

---

## 📊 Database Schema (Supabase)

### 1. Run these SQL migrations in Supabase SQL Editor

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

-- Index for fast lookups
CREATE INDEX idx_rip_balances_user_id ON rip_balances(user_id);

-- RLS Policies
ALTER TABLE rip_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balance"
  ON rip_balances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only server can update balances (via service role)
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
  price_cents INTEGER NOT NULL, -- Store in cents to avoid decimal issues
  price_usd DECIMAL(10, 2) GENERATED ALWAYS AS (price_cents / 100.0) STORED,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  stripe_price_id VARCHAR(255), -- Stripe Price ID
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed data
INSERT INTO rip_bundles (name, rips, price_cents, discount_percent, sort_order) VALUES
  ('5 Rips', 5, 500, 0, 1),
  ('10 Rips', 10, 900, 10, 2),
  ('25 Rips', 25, 2200, 12, 3),
  ('50 Rips', 50, 4000, 20, 4)
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE rip_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active bundles"
  ON rip_bundles FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- ============================================================================
-- TRANSACTIONS TABLE (Audit log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rip_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'purchase', 'pack_open', 'card_sellback', 'admin_adjustment'
  amount DECIMAL(10, 2) NOT NULL, -- Positive for credit, negative for debit
  balance_after DECIMAL(10, 2) NOT NULL,
  metadata JSONB, -- Store additional context (stripe_payment_id, pack_id, card_id, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (type IN ('purchase', 'pack_open', 'card_sellback', 'admin_adjustment', 'refund'))
);

-- Indexes
CREATE INDEX idx_rip_transactions_user_id ON rip_transactions(user_id);
CREATE INDEX idx_rip_transactions_type ON rip_transactions(type);
CREATE INDEX idx_rip_transactions_created_at ON rip_transactions(created_at DESC);

-- RLS
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
  stripe_checkout_session_id VARCHAR(255) UNIQUE,
  bundle_id UUID REFERENCES rip_bundles(id),
  amount_cents INTEGER NOT NULL,
  rips_purchased INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'pending', 'succeeded', 'failed', 'refunded'
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded'))
);

-- Indexes
CREATE INDEX idx_stripe_payments_user_id ON stripe_payments(user_id);
CREATE INDEX idx_stripe_payments_stripe_payment_intent_id ON stripe_payments(stripe_payment_intent_id);
CREATE INDEX idx_stripe_payments_status ON stripe_payments(status);

-- RLS
ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON stripe_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- CARD TIERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS card_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  min_value_cents INTEGER NOT NULL,
  max_value_cents INTEGER NOT NULL,
  probability DECIMAL(5, 4) NOT NULL, -- 0.5500 = 55%
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (probability >= 0 AND probability <= 1),
  CHECK (min_value_cents <= max_value_cents)
);

-- Seed data (from your documentation)
INSERT INTO card_tiers (name, min_value_cents, max_value_cents, probability, sort_order) VALUES
  ('Trash', 25, 75, 0.5500, 1),
  ('Low', 75, 150, 0.2500, 2),
  ('Mid', 150, 500, 0.1400, 3),
  ('High', 500, 2500, 0.0550, 4),
  ('Chase', 2500, 10000, 0.0045, 5),
  ('Ultra Chase', 10000, 50000, 0.0005, 6)
ON CONFLICT DO NOTHING;

-- Verify probabilities sum to 1.0
-- SELECT SUM(probability) FROM card_tiers; -- Should equal 1.0000

-- RLS
ALTER TABLE card_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tiers"
  ON card_tiers FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- ============================================================================
-- PACKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  rip_cost INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  total_openings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed one pack to start
INSERT INTO packs (name, description, rip_cost) VALUES
  ('Standard Pack', 'Open for a chance to pull valuable cards!', 1)
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packs"
  ON packs FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- ============================================================================
-- PACK OPENINGS TABLE (History)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pack_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES packs(id),
  rips_spent INTEGER NOT NULL,
  cards_pulled JSONB NOT NULL, -- Array of card objects
  total_value_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pack_openings_user_id ON pack_openings(user_id);
CREATE INDEX idx_pack_openings_created_at ON pack_openings(created_at DESC);

-- RLS
ALTER TABLE pack_openings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own openings"
  ON pack_openings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- USER INVENTORY TABLE (Pulled cards that haven't been sold back)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_opening_id UUID REFERENCES pack_openings(id),
  card_name VARCHAR(255) NOT NULL,
  card_value_cents INTEGER NOT NULL,
  tier_name VARCHAR(50) NOT NULL,
  is_sold BOOLEAN DEFAULT false,
  sold_at TIMESTAMPTZ,
  sellback_rips DECIMAL(10, 2), -- 85% of card value
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_user_inventory_is_sold ON user_inventory(is_sold);

-- RLS
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory"
  ON user_inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- SYSTEM CONFIG TABLE (Global settings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed config
INSERT INTO system_config (key, value, description) VALUES
  ('max_card_value_cents', '50000', 'Maximum card value cap ($500)'),
  ('sellback_rate', '0.85', 'Percentage of card value returned as Rips (85%)'),
  ('packs_enabled', 'true', 'Global kill switch for pack openings'),
  ('daily_ultra_chase_limit', '1', 'Max ultra chase pulls per day')
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view config"
  ON system_config FOR SELECT
  TO authenticated, anon
  USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get user's Rip balance
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

-- Function to add Rips (after successful payment)
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

-- Function to spend Rips (for pack opening)
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

  -- Record transaction (negative amount)
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

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rip_balances_updated_at BEFORE UPDATE ON rip_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rip_bundles_updated_at BEFORE UPDATE ON rip_bundles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_payments_updated_at BEFORE UPDATE ON stripe_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packs_updated_at BEFORE UPDATE ON packs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔧 Environment Variables

Add to your `.env`:

```env
# Existing Supabase vars
PUBLIC_SUPABASE_URL=your-url
PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URLs
PUBLIC_APP_URL=http://localhost:5173
```

---

## 📦 Install Dependencies

```bash
npm install stripe @stripe/stripe-js
```

---

## Next Steps

I'll now create the implementation files:

1. ✅ Database schema (above)
2. Stripe utility functions
3. API routes for:
   - Creating checkout sessions
   - Handling webhooks
   - Getting Rip balance
   - Opening packs
   - Selling cards back
4. Frontend components for purchasing
5. Admin dashboard for monitoring

Would you like me to create all the implementation files now?
