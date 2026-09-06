import { useState, useCallback } from 'react';

export function useFetch<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute, setData };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDecimal(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}
