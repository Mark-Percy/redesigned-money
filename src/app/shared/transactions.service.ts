import { Injectable, forwardRef } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, query, orderBy, limit, writeBatch, getDoc, runTransaction, where, updateDoc, DocumentData, getAggregateFromServer, count, sum, Query } from '@angular/fire/firestore';
import { FormArray } from '@angular/forms';
import { TransactionInterface } from '../add-transaction/add-transaction.component';
import { Amount } from "./amount";
import { AuthorisationService } from './../authorisation.service';
import { SavingsService } from './savings.service';
import { Account } from '../user/account/account.interface';
import { AccountsService } from './accounts.service';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  accounts: Account[];
  years: Map<number, Map<number, TransactionMonthInterface>> = new Map();
  currDate = new Date();
  currYearInd: number = 0
  currMonthInd: number = 0

  constructor(private fs: Firestore, private auth: AuthorisationService, private savingsService: SavingsService, private accountsService: AccountsService) {
    this.accountsService.getAccounts().pipe(take(1)).subscribe(data => {
      this.accounts = data
    })
  }

  async addTransaction(transactionForm: TransactionInterface, items:any, accountName: string): Promise<any> {
    let resCode = 0
    const savings = transactionForm.category == 'savings'
    if(!savings && transactionForm.amount){
      resCode = (await this.updateMonth(transactionForm.transactionDate, transactionForm.category, transactionForm.frequency, transactionForm.account, transactionForm.amount)).code;
    }
    if(resCode == 1 || savings) {
      const transCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/transactions');
      return addDoc(transCol, transactionForm).then(transaction => {
        if(!savings) {
          return this.addItems(items, transaction.id)
        } else {
          if(transactionForm.amount) this.savingsService.updatePot(transactionForm.pot, transactionForm.toAccount, transactionForm.amount);
          return 1
        } 
      });
    }
  }
  
  addItems(items: FormArray, transactionId: string) {
    const itemsCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/items');
    const batch = writeBatch(this.fs);
    const curritem = {
      transactionId: transactionId,
      item: null,
      amount: null
    }
    items.controls.forEach(item => {
      curritem.item = item.value.item;
      curritem.amount = item.value.amount;
      batch.set(doc(itemsCol), curritem);
    })
    const res = {code: 0, message: 'Failed'}
    batch.commit().then(() => {
      res.code = 1
      res.message = 'Success'
    }).catch((e) => {
      console.error(e.message)
    });
    return res
  }

  getTransactions(numberToLimit: number): Observable<TransactionInterface[]> {
    const transCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/transactions');
    const q = query(transCol, orderBy('transactionDate', 'desc'), limit(numberToLimit))
    return collectionData(q, {idField: 'id'}) as Observable<TransactionInterface[]>
  }

  async setMonth(date: Date, includeTransactions: boolean): Promise<TransactionMonthInterface> {
    const year: number = date.getFullYear()
    const month: number = date.getMonth()
    const monthName = new Date(0, month).toLocaleString('default', { month: 'long' });
    
    const transCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/transactions');
    const start = new Date(year, date.getMonth(), 1)
    const end = new Date(year, date.getMonth() + 1, 0, 23, 59, 59)

    const allTrans = query(transCol,
      where('transactionDate', '>=', start),
      where('transactionDate', '<=', end)
    );

    let heldYear = this.years.get(year)
    if(heldYear) {
      const heldMonth = heldYear.get(month);
      if(heldMonth) {
        const transactionsExist =  heldMonth.transactions
        if(!transactionsExist && includeTransactions) heldMonth.transactions = this.getTransactionsDataForMonth(allTrans)
        return heldMonth
      }
    } else {
      this.years.set(year, new Map())
      heldYear = this.years.get(year)
    }
    

    // Might be ported so that users can create their own categories
    // set up category amounts
    const categories = ['bills', 'spending', 'useless'];
    let categoryAmountsMap: Map<string, number> = new Map()
    let accountAmountsMap: Map<string, number> = new Map()

    for(let category of categories) {
      const groupedTrans = query(transCol,
        where('transactionDate', '>=', start),
        where('transactionDate', '<=', end),
        where('category', '==', category)
      );
      const snap = await getAggregateFromServer(groupedTrans, {
        amount: sum('amount')
      })
      categoryAmountsMap.set(category, snap.data().amount)
    }
    const accounts = (await this.accountsService.getAccountsStatic('Savings', true)).docs;
    for(let account of accounts) {
        const groupedTrans = query(transCol,
        where('transactionDate', '>=', start),
        where('transactionDate', '<=', end),
        where('account', '==', account.id)
      );
      const snap = await getAggregateFromServer(groupedTrans, {
        amount: sum('amount')
      })
      accountAmountsMap.set(account.data().name, snap.data().amount)
    }

    // Totals
    const allSnap = getAggregateFromServer(allTrans, {
      countOfDocs: count(),
      sumOfAmounts: sum('amount')
    });

    const data = await allSnap
    const monthData: TransactionMonthInterface = {
      totalAmount: data.data().sumOfAmounts,
      totalTransactions: data.data().countOfDocs,
      categoryAmounts: categoryAmountsMap,
      accountAmounts: accountAmountsMap,
      monthName: monthName
    }
    if(includeTransactions) monthData.transactions = this.getTransactionsDataForMonth(allTrans)
    heldYear?.set(month, monthData)
    return monthData
  }

  getTransactionsDataForMonth(allTrans: Query<DocumentData, DocumentData>) {
    return collectionData(allTrans, {idField: 'id'}) as Observable<TransactionInterface[]>
  }

  async updateTransaction(id: string, transaction: any, oldTransaction: any) {
    let amountUpdated = false
    const oldAccount = oldTransaction.account
    const newAccount = transaction.account
    if(oldAccount && newAccount) {
      await this.updateMonth(oldTransaction.transactionDate,
        oldTransaction.category,
        oldTransaction.frequency,
        oldAccount,
        Number(0 - oldTransaction.amount.toFixed(2))
      )  
      await this.updateMonth(transaction.transactionDate,
        transaction.category,
        transaction.frequency,
        newAccount,
        transaction.amount)
      amountUpdated = true  
    }
    const transCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/transactions');
    const transactionRef = doc(transCol, id)
    await updateDoc(transactionRef, transaction)
    return {success: true, amountUpdate: amountUpdated}
  }

  async deleteTransaction(transactionId: string, amount: number, account: string, category: string, date: Date, frequency : string) {
    const transCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/transactions');
    const itemsCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/items');
    const items = this.getItems(transactionId);

    items.forEach((data) => {
      if(data[0]) {
        deleteDoc(doc(itemsCol,data[0].id))
      }
    });
    if(!(category == 'savings')) {
      const accounts = this.accountsService.getAccounts()
      const accountsMap = new Map()
      accounts.pipe(take(1)).subscribe(docs => {
        docs.forEach(doc => {
          accountsMap.set(doc.id, doc.name)
        })
      })
      const accountToUse = accountsMap.get(account)
      if(accountToUse) this.updateMonth(date, category, frequency, accountToUse, 0 - amount)
    }
    await this.updateMonth(date, category, frequency, account, 0 - amount, true)
    await deleteDoc(doc(transCol, transactionId))
  }

  getItems(transactionId: string) {
    const itemsCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/items');

    const q = query(itemsCol, where('transactionId', '==', transactionId))
    return collectionData(q, {idField: 'id'})
  }

  async updateMonth(
    date:Date,
    category:string,
    frequency: string,
    account:string,
    amount: number,
    remove?: boolean
  ):Promise<{code: number, message:string}> {
    const accountName = this.accounts.find(accountFind => accountFind.id == account)?.name
    if(!accountName) throw new Error(`Account Not Id: ${account}; doesn't exist`)

    const num = remove ? -1 : 1
    const year = date.getFullYear();
    const month = date.getMonth();
    let message = '';
    const yearHeld = this.years.get(year);
    let monthHeld
    if(yearHeld) monthHeld = yearHeld.get(month);
    if(monthHeld) {
      monthHeld.totalAmount = Number((monthHeld.totalAmount + amount).toFixed(2))
      monthHeld.totalTransactions += num
      this.setSubAmounts(category, accountName, amount, frequency, monthHeld)
    }
    return {code: 1, message: `Successful Month Amount: ${message}`}
  }

  setSubAmounts(category: string, account:string, amount: number, frequency: string, transactionMonth: TransactionMonthInterface) {
    //Categories
    const accountAmounts = transactionMonth.accountAmounts
    const categoryAmounts = transactionMonth.categoryAmounts
    const categoryAm = categoryAmounts.get(category)
    if(!categoryAm) categoryAmounts.set(category, amount);
    else categoryAmounts.set(category, Number((categoryAm + amount).toFixed(2)));

    //Accounts
    const currAccountAm = accountAmounts.get(account);
    if(!currAccountAm) accountAmounts.set(account, amount)
    else accountAmounts.set(account, Number((currAccountAm + amount).toFixed(2)));
  
  }

  async setTransactionsForYear(date: Date): Promise<Map<number, TransactionMonthInterface>> {
    for (let i = 0; i < 12; i++) {
      date.setMonth(i);
      this.setMonth(date, false);
    }
    const yearData = this.years.get(date.getFullYear())
    if(yearData) return yearData
    throw new Error(`There was an error Adding the selected year to the year data: ${date.getFullYear()}`)
  }

  clearMonths() {
    this.years.clear()
  }
}

export interface TransactionMonthInterface {
  transactions?: Observable<TransactionInterface[]>;
  totalAmount: number;
  totalTransactions: number;
  categoryAmounts: Map<string, number>;
  accountAmounts: Map<string, number>;
  monthName: string;
}