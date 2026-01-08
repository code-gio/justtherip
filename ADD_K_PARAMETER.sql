-- ============================================================================
-- ADD K PARAMETER TO SYSTEM_CONFIG
-- ============================================================================
-- Migration script to add the curvature parameter (k) for inverse-power
-- probability distribution. Default value is 1.1.

-- Insert k parameter if it doesn't exist
INSERT INTO system_config (key, value, description) VALUES
  ('probability_curvature_k', '1.1', 'Curvature parameter for inverse-power probability distribution (typically 0.9-1.3)')
ON CONFLICT (key) DO NOTHING;

-- Verify the insertion
-- SELECT * FROM system_config WHERE key = 'probability_curvature_k';
