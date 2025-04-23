export interface Transaction {
  id: string;
  transactionDate: Date;
  date: Date;
  account: string;
  toAccount: string;
  pot: string;
  category: string;
  location: string;
  amount: number | null;
  frequency: string;
  items: [{
    item: string,
    amount: number
  }] | [];
}