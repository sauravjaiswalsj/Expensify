export type Currency =
  | "INR"
  | "USD"
  | "EUR"
  | "JPY"
  | "GBP"
  | "AUD"
  | "CAD"
  | "CHF"
  | "CNY"
  | "SEK"
  | "NZD";

export type Role = "USER" | "ADMIN" | "MANAGER" | "MODERATOR";

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isAccountVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id?: string;
  username?: string;
  amount: number;
  category: string;
  description: string;
  paymentType: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  currency: Currency;
}

export interface ExpenseSummary {
  totalSpend: number;
  monthlySpend: number;
  categoryCount: number;
  transactionCount: number;
}

export interface AiInsightResponse {
  reply: string;
  aiGenerated: boolean;
}

export interface LoginDTO {
  username?: string;
  email?: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  expiresIn: number;
}

export interface UserDTO {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface VerifyUserDTO {
  username: string;
  verificationCode: string;
}

export interface PasswordResetDTO {
  username: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
}

export interface ResponseHeader {
  httpResponseStatus: string;
  responseMessage: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  correlationId?: string;
  header?: ResponseHeader;
  methodBody?: T;
}

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Health & Medical",
  "Housing & Rent",
  "Utilities",
  "Education",
  "Travel",
  "Personal Care",
  "Insurance",
  "Savings & Investment",
  "Gifts & Donations",
  "Other",
];

export const PAYMENT_TYPES = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "UPI",
  "Net Banking",
  "Wallet",
  "Cheque",
  "Other",
];

export const CURRENCIES: { code: Currency; label: string; symbol: string }[] =
  [
    { code: "INR", label: "Indian Rupee", symbol: "₹" },
    { code: "USD", label: "US Dollar", symbol: "$" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "JPY", label: "Japanese Yen", symbol: "¥" },
    { code: "GBP", label: "British Pound", symbol: "£" },
    { code: "AUD", label: "Australian Dollar", symbol: "A$" },
    { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
    { code: "CHF", label: "Swiss Franc", symbol: "CHF" },
    { code: "CNY", label: "Chinese Yuan", symbol: "¥" },
    { code: "SEK", label: "Swedish Krona", symbol: "kr" },
    { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$" },
  ];
