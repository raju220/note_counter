import React from 'react';

export enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string
  timestamp: number;
}

export interface FinancialSummary {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalIncome: number;
  netProfit: number;
  balance: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}