import { TxStatusResponse } from '@skip-go/client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StoredTransaction = {
  txHash: string
  chainID: string
  timestamp: number
  sourceAsset: {
    symbol: string | undefined
    denom: string
    amount: string
    chainId: string
  }
  destAsset: {
    symbol: string | undefined
    denom: string
    amount: string
    chainId: string
  }
  status?: TxStatusResponse
  explorerLink?: string
}

type TransactionStore = {
  transactions: StoredTransaction[]
  addTransaction: (transaction: StoredTransaction) => void
  removeTransaction: (txHash: string) => void
  updateTransactionStatus: (txHash: string, status: TxStatusResponse) => void
  updateTransactionExplorerLink: (txHash: string, explorerLink: string) => void
  clearTransactions: () => void
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: state.transactions.some((tx) => tx.txHash === transaction.txHash)
            ? state.transactions // If duplicate found, return unchanged array
            : [...state.transactions, transaction],
        })),
      removeTransaction: (txHash) =>
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.txHash !== txHash),
        })),
      updateTransactionStatus: (txHash, status) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.txHash === txHash ? { ...tx, status } : tx,
          ),
        })),
      updateTransactionExplorerLink: (txHash, explorerLink) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.txHash === txHash ? { ...tx, explorerLink } : tx,
          ),
        })),
      clearTransactions: () => set({ transactions: [] }),
    }),
    {
      name: 'transaction-store',
    },
  ),
)
