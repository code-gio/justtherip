export interface Transaction {
  id: string;
  type: "purchase" | "pack_open" | "card_sellback" | string;
  amount: number;
  created_at: string;
  metadata?: {
    bundle_id?: string;
    pack_id?: string;
    [key: string]: unknown;
  };
}

export interface FormattedTransaction {
  action: string;
  description: string;
  type: "credit" | "debit";
}

export interface Bundle {
  id: string;
  name: string;
  rips: number;
  price: number;
  bonus?: number;
}

