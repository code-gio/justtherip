-- ============================================================================
-- SHIPPING ADDRESSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shipping_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Address Fields
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255) NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'US',
  
  -- Metadata
  is_default BOOLEAN NOT NULL DEFAULT false,
  label VARCHAR(50) NULL, -- 'Home', 'Work', etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT shipping_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT shipping_addresses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for shipping_addresses
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id 
  ON public.shipping_addresses USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_default 
  ON public.shipping_addresses USING btree (user_id, is_default) 
  WHERE is_default = true;

-- Partial unique index: Only one default address per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_shipping_addresses_user_default_unique
  ON public.shipping_addresses (user_id)
  WHERE is_default = true;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_shipping_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shipping_addresses_updated_at ON public.shipping_addresses;
CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON public.shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_shipping_addresses_updated_at();

-- ============================================================================
-- SHIPMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  inventory_card_id UUID NOT NULL,
  
  -- Shipment Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- Values: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  
  -- Shipping Information
  shipping_address_id UUID NULL,
  -- Denormalized for historical record (address may change)
  shipping_address_full TEXT NOT NULL, -- Full formatted address string
  shipping_name VARCHAR(255) NOT NULL,
  shipping_phone VARCHAR(50) NULL,
  
  -- Tracking Information
  carrier VARCHAR(50) NULL, -- 'UPS', 'USPS', 'FedEx', etc.
  tracking_number VARCHAR(255) NULL,
  estimated_delivery_date DATE NULL,
  delivered_date TIMESTAMPTZ NULL,
  
  -- Card Information (denormalized for historical record)
  card_name VARCHAR(255) NOT NULL,
  card_tier_name VARCHAR(50) NOT NULL,
  card_value_cents INTEGER NOT NULL,
  card_image_url TEXT NULL,
  
  -- Request Information
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ NULL, -- When admin marks as processing
  shipped_at TIMESTAMPTZ NULL, -- When admin marks as shipped
  
  -- Admin Notes
  admin_notes TEXT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT shipments_pkey PRIMARY KEY (id),
  CONSTRAINT shipments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT shipments_inventory_card_id_fkey 
    FOREIGN KEY (inventory_card_id) REFERENCES user_inventory(id) ON DELETE RESTRICT,
  CONSTRAINT shipments_shipping_address_id_fkey 
    FOREIGN KEY (shipping_address_id) REFERENCES shipping_addresses(id) ON DELETE SET NULL,
  CONSTRAINT shipments_status_check CHECK (
    status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')
  ),
  -- Tracking required for shipped/delivered status
  CONSTRAINT shipments_tracking_check CHECK (
    (status IN ('shipped', 'delivered') AND tracking_number IS NOT NULL AND carrier IS NOT NULL) OR
    (status NOT IN ('shipped', 'delivered'))
  )
);

-- Indexes for shipments
CREATE INDEX IF NOT EXISTS idx_shipments_user_id 
  ON public.shipments USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_shipments_status 
  ON public.shipments USING btree (status);

CREATE INDEX IF NOT EXISTS idx_shipments_inventory_card_id 
  ON public.shipments USING btree (inventory_card_id);

CREATE INDEX IF NOT EXISTS idx_shipments_requested_at 
  ON public.shipments USING btree (requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_shipments_user_status 
  ON public.shipments USING btree (user_id, status);

CREATE INDEX IF NOT EXISTS idx_shipments_shipping_address_id 
  ON public.shipments USING btree (shipping_address_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_shipments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shipments_updated_at ON public.shipments;
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_shipments_updated_at();

-- ============================================================================
-- UPDATE USER_INVENTORY TABLE
-- ============================================================================
ALTER TABLE public.user_inventory
ADD COLUMN IF NOT EXISTS shipment_id UUID NULL,
ADD COLUMN IF NOT EXISTS is_shipped BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ NULL;

-- Add indexes for shipment tracking (before foreign key)
CREATE INDEX IF NOT EXISTS idx_user_inventory_shipment_id 
  ON public.user_inventory USING btree (shipment_id) 
  WHERE shipment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_inventory_is_shipped 
  ON public.user_inventory USING btree (is_shipped);

CREATE INDEX IF NOT EXISTS idx_user_inventory_available 
  ON public.user_inventory USING btree (user_id, is_sold, is_shipped) 
  WHERE (is_sold = false AND is_shipped = false);

-- Add foreign key constraint to shipments (after shipments table exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_inventory_shipment_id_fkey'
  ) THEN
    ALTER TABLE public.user_inventory
    ADD CONSTRAINT user_inventory_shipment_id_fkey 
      FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add constraint to prevent card from being both sold and shipped
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_inventory_sell_ship_check'
  ) THEN
    ALTER TABLE public.user_inventory
    ADD CONSTRAINT user_inventory_sell_ship_check CHECK (
      (is_sold = false) OR (is_shipped = false)
    );
  END IF;
END $$;

-- Add constraint for shipped status consistency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_inventory_shipped_status_check'
  ) THEN
    ALTER TABLE public.user_inventory
    ADD CONSTRAINT user_inventory_shipped_status_check CHECK (
      (
        -- Not shipped: shipment fields must be null/false
        (is_shipped = false) AND 
        (shipped_at IS NULL)
      ) OR (
        -- Shipped: shipped_at must be set
        (is_shipped = true) AND 
        (shipped_at IS NOT NULL)
      )
    );
  END IF;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Shipping Addresses RLS
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own shipping addresses" ON public.shipping_addresses;
DROP POLICY IF EXISTS "Users can insert their own shipping addresses" ON public.shipping_addresses;
DROP POLICY IF EXISTS "Users can update their own shipping addresses" ON public.shipping_addresses;
DROP POLICY IF EXISTS "Users can delete their own shipping addresses" ON public.shipping_addresses;

CREATE POLICY "Users can view their own shipping addresses"
  ON public.shipping_addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shipping addresses"
  ON public.shipping_addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shipping addresses"
  ON public.shipping_addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shipping addresses"
  ON public.shipping_addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Shipments RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Users can create their own shipments" ON public.shipments;

CREATE POLICY "Users can view their own shipments"
  ON public.shipments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shipments"
  ON public.shipments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    status = 'pending'
  );

-- Note: UPDATE and DELETE policies for shipments should be admin-only
-- You'll need to add admin role checking or use service_role for admin operations
-- For now, users can only create shipments, admins will update via service_role

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.shipping_addresses IS 'Stores user shipping addresses for card shipments';
COMMENT ON TABLE public.shipments IS 'Tracks physical card shipments from user inventory';
COMMENT ON COLUMN public.shipments.shipping_address_full IS 'Full formatted address string for historical record (address may change)';
COMMENT ON COLUMN public.shipments.card_name IS 'Denormalized card name for historical record';
COMMENT ON COLUMN public.user_inventory.shipment_id IS 'Links to active shipment request for this card';