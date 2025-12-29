/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PackOdds {
  tier: string;
  chance: number;
  color: string;
}

export interface Pack {
  id: string;
  name: string;
  set: string;
  price: number;
  ev: number;
  image: string | null;
  description?: string | null;
  gradient: string;
  icon: any;
  featured: boolean;
  hot: boolean;
  new: boolean;
  odds: PackOdds[];
  totalOpened: number;
}

export interface Category {
  id: string;
  label: string;
  icon: any;
}

export interface SortOption {
  value: string;
  label: string;
}

