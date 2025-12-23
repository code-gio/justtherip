export type ShipmentStatus = "pending" | "processing" | "shipped" | "delivered";

export interface Shipment {
  id: string;
  cardName: string;
  cardTier: string;
  cardValue: string;
  cardImage?: string;
  status: ShipmentStatus;
  requestDate: string;
  trackingNumber: string | null;
  carrier: string | null;
  estimatedDelivery: string | null;
  deliveredDate?: string | null;
  shippingAddress?: string;
}

export interface ShipmentStatusConfig {
  label: string;
  description: string;
  step: number;
}

export const SHIPMENT_STATUS_CONFIG: Record<ShipmentStatus, ShipmentStatusConfig> = {
  pending: {
    label: "Order placed",
    description: "Your shipment request has been received",
    step: 1,
  },
  processing: {
    label: "Preparing",
    description: "We're preparing your card for shipment",
    step: 2,
  },
  shipped: {
    label: "Shipped",
    description: "Your card is on its way",
    step: 3,
  },
  delivered: {
    label: "Delivered",
    description: "Your card has been delivered",
    step: 4,
  },
};

export function getTrackingUrl(carrier: string | null, trackingNumber: string | null): string | null {
  if (!carrier || !trackingNumber) return null;

  const urls: Record<string, string> = {
    UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    FedEx: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
  };

  return urls[carrier] || null;
}

