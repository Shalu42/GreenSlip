export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  parsedText: string;
  amount: number;
  currency: string;
  vendor: string;
  category: string;
  items: ReceiptItem[];
  warrantyInfo?: WarrantyInfo;
  ecoScore: number;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  category: string;
  ecoImpact: number;
}

export interface WarrantyInfo {
  hasWarranty: boolean;
  warrantyPeriod?: string;
  expiryDate?: string;
  isExpiring?: boolean;
}

export interface EcoStats {
  totalScore: number;
  averageScore: number;
  greenPurchases: number;
  totalPurchases: number;
  monthlyTrend: { month: string; score: number }[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}