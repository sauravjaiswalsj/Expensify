"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { ApiError, expenseApi } from "@/lib/api";
import type { Expense, ApiResponse } from "@/types";

interface ExpenseDataContextValue {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ExpenseDataContext = createContext<ExpenseDataContextValue | null>(null);

export function ExpenseDataProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: ApiResponse<Expense[]> = await expenseApi.getAll();
      setExpenses(Array.isArray(response?.methodBody) ? response.methodBody : []);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        setExpenses([]);
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load expenses."
        );
      }
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, []);

  useEffect(() => {
    if (!fetched) {
      void refresh();
    }
  }, [fetched, refresh]);

  return (
    <ExpenseDataContext.Provider value={{ expenses, loading, error, refresh }}>
      {children}
    </ExpenseDataContext.Provider>
  );
}

export function useExpenseData() {
  const ctx = useContext(ExpenseDataContext);
  if (!ctx) throw new Error("useExpenseData must be used within ExpenseDataProvider");
  return ctx;
}
