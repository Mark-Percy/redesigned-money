import { Observable } from "rxjs";
import { Transaction } from "./transaction.interface";

export interface TransactionMonth {
  transactions?: Observable<Transaction[]>;
  totalAmount: number;
  totalTransactions: number;
  totalsExcl: number;
  categoryAmounts: Map<string, number>;
  accountAmounts: Map<string, number>;
  monthName: string;
}