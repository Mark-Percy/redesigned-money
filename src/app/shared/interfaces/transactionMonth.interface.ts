import { Observable } from "rxjs";
import { TransactionInterface } from "./transaction.interface";

export interface TransactionMonthInterface {
  transactions?: Observable<TransactionInterface[]>;
  totalAmount: number;
  totalTransactions: number;
  totalsExcl: number;
  categoryAmounts: Map<string, number>;
  accountAmounts: Map<string, number>;
  monthName: string;
}