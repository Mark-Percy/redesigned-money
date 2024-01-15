import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, query, orderBy, limit, writeBatch, getDoc, runTransaction, where, updateDoc, DocumentData, getAggregateFromServer, count, sum } from '@angular/fire/firestore';
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
  transactionsForYear: TransactionsInterface = {years: []};
  currDate = new Date();
  currMonth: TransactionMonthInterface;

  accountMap: Map<string,string> = new Map()

  constructor(private fs: Firestore, private auth: AuthorisationService, private savingsService: SavingsService, private accountsService: AccountsService) {
    this.accountsService.getAccounts().pipe(take(1)).subscribe(data => {
      this.accounts = data
      this.accounts.forEach(doc => {
        if(doc.id) this.accountMap.set(doc.id, doc.name)
      })
    })
  }

  async addTransaction(transactionForm: TransactionInterface, items:any, accountName: string): Promise<any> {
    let resCode = 0
    const savings = transactionForm.category == 'savings'
    if(!savings && transactionForm.amount){
      resCode = await this.updateMonth(transactionForm.transactionDate, transactionForm.category, transactionForm.frequency, accountName, transactionForm.amount).then((res) => {
        return res.code
      });
    }
    if(resCode == 1 || savings) {
      const transCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/transactions');
      return addDoc(transCol, transactionForm).then(transaction => {
        this.currMonth.totalTransactions += 1
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

  setTransactions(numberToLimit: number){
    const transCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/transactions');
    const q = query(transCol, orderBy('transactionDate', 'desc'), limit(numberToLimit))
    return collectionData(q, {idField: 'id'})
  }

  async setTransactionsForMonth(date: Date, monthNum: number, mult?: boolean): Promise<TransactionMonthInterface> {
    const transCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/transactions');
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth()+1, 0, 23, 59, 59)
    const q = query(transCol,
      where('transactionDate', '>=', start),
      where('transactionDate', '<=', end)
    );
    const snap = getAggregateFromServer(q, {
      countOfDocs: count(),
      sumOfAmounts: sum('amount')
    });
    const data = await snap
    const transactions = collectionData(q, {idField: 'id'})
    const month: TransactionMonthInterface = {
      monthNum: mult ? monthNum : date.getMonth(),
      transactions: transactions,
      totalAmount: data.data().sumOfAmounts,
      totalTransactions: data.data().countOfDocs,
      categoryAmounts: new Map(),
      accountAmounts: new Map()
    }
    this.setAmounts(month)
    return month
  }
  // Depracated if amount for months is on the fly
  async getAmountForMonth(date: Date): Promise<DocumentData | null> {
    const month = date.toLocaleString('en-GB',{month:'long'})
    const year = date.getFullYear()
    const monthRef = doc(this.fs,`users/${this.auth.getUserId()}/${year}/${month}`)
    const monthSnap = await getDoc(monthRef)
    if(monthSnap.exists()){
      const data: any = monthSnap.data()
      const amounts: Amount[] = []
      for(const key in data) {
        if(key != 'bills') {
          amounts.push({name: key, amount: data[key]})
        } else {
          amounts.push({name:'monthly', amount: data[key].Monthly})
          amounts.push({name:'annaully', amount: data[key].Annually})
        }
      }
      return [amounts]
    }
    return null;
  }

  async updateTransaction(id: string, transaction: any, oldTransaction: any) {
    let amountUpdated = false
    if((transaction.transactionDate.getMonth()!= oldTransaction.transactionDate.getMonth()) ||
      transaction.transactionDate.getFullYear() != oldTransaction.transactionDate.getFullYear()
    ){
      const oldAccount = this.accounts.find(item => oldTransaction.account == item.id)?.name
      const newAccount = this.accounts.find(item => transaction.account == item.id)?.name
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
      accounts.forEach(docs => {
        docs.forEach(doc => {
          accountsMap.set(doc.id, doc.name)
        })
      })
      const accountToUse = this.accountMap.get(account)
      if(accountToUse) this.updateMonth(date, category, frequency, accountToUse, 0 - amount)
    }
    deleteDoc(doc(transCol, transactionId)).then(() => {
      this.currMonth.totalTransactions -= 1
    })
  }

  getItems(transactionId: string) {
    const itemsCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/items');

    const q = query(itemsCol, where('transactionId', '==', transactionId))
    return collectionData(q, {idField: 'id'})
  }

  async updateMonth(date:Date, category:string, frequency: string, account:string, amount: number): Promise<{code: number, message:string}> {

    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' })
    const monthDocRef= doc(this.fs,`users/${this.auth.getUserId()}/${year}/${month}`)
    let message = '';

    try {
      await runTransaction(this.fs, async(transaction) => {
        const monthDoc = await transaction.get(monthDocRef);
        //Transition to new calculating amount through existing queries: add to variable
        this.currMonth.totalAmount = Number((this.currMonth.totalAmount + amount).toFixed(2))

        this.setSubAmounts(category, account, amount, frequency, this.currMonth)
        // End of code for transition
        if (!monthDoc.exists()) {
          message = 'Adding new month'
          let monthData = {}
          let nonAddedFreq = frequency == 'Monthly' ? 'Annually' : 'Monthly'
          if(category == 'bills'){
            monthData = {amount:Number(amount), [category]: {[frequency]: Number(amount), [nonAddedFreq]: Number(0)}, [account]: Number(amount)}
          } else {
            monthData = {amount:Number(amount), [category]: Number(amount), [account]: Number(amount), bills: {Monthly: Number(0), Annually: Number(0)}}
          }
          transaction.set(monthDocRef,monthData)
        } else {
          message = 'Updating existing month'
          const newAmount = Number((monthDoc.data().amount + amount).toFixed(2))
          let categoryAmount = 0
          if(category == 'bills'){
            let bills = monthDoc.get(category)
            bills[frequency] = Number((bills[frequency] + amount).toFixed(2))
            categoryAmount = bills
          } else {
            categoryAmount = Number(monthDoc.get(category) ? (monthDoc.get(category) +  amount).toFixed(2) : amount)
          }
          const accountAmount = Number(monthDoc.get(account) ? (monthDoc.get(account) +  amount).toFixed(2) : amount)
          
          transaction.update(monthDocRef, {amount: newAmount, [category]: categoryAmount, [account]: accountAmount})
        }
      });
    } catch (e:any) {
      console.error(e.message)
      return {code: 0, message: `Month Amounts failed: ${message}`}
    }
    return {code: 1, message: `Successful Month Amount: ${message}`}
  }

  setAmounts(transactionMonth: TransactionMonthInterface){
    const accounts = this.accountsService.getAccounts()
    const accountsMap = new Map()
    accounts.pipe(take(1)).subscribe(docs => {
      docs.forEach(doc => {
        accountsMap.set(doc.id, doc.name)
      })
    })
    transactionMonth.transactions.pipe(take(1)).subscribe(docs => {
      docs.forEach(doc => {
        const account = accountsMap.get(doc.account)
        this.setSubAmounts(doc.category, account, doc.amount, doc.frequency, transactionMonth);
      });
    });
  }

  setSubAmounts(category: string, account:string, amount: number, frequency: string, transactionMonth: TransactionMonthInterface) {
    //Categories
    const accountAmounts = transactionMonth.accountAmounts
    const categoryAmounts = transactionMonth.categoryAmounts
    const categoryAm = categoryAmounts.get(category)
    if(!categoryAm && category != 'bills') categoryAmounts.set(category, amount);
    else if(category == 'bills'){
      const categoryFreq = categoryAmounts.get(frequency)
      if(categoryFreq) categoryAmounts.set(frequency, Number((categoryFreq + amount).toFixed(2)));
      else categoryAmounts.set(frequency, amount);
    }
    else if(categoryAm) categoryAmounts.set(category, Number((categoryAm + amount).toFixed(2)));

    //Accounts
    const currAccountAm = accountAmounts.get(account);
    if(!currAccountAm) accountAmounts.set(account, amount)
    else accountAmounts.set(account, Number((currAccountAm + amount).toFixed(2)));
  }

  async setTransactionsForYear(date: Date) {
    for (let i = 0; i < 12; i++) {
      date.setMonth(i);
      this.setCurrentMonth(date, true, i)
    }
  }

  async setCurrentMonth(date: Date, justLoad: boolean, monthNum: number) {
    const yearcomp: number = date.getFullYear()
    const monthcomp = justLoad ? monthNum : date.getMonth()

    let transactionYear: TransactionsYearInterface | undefined  = this.transactionsForYear.years.find(year => year.yearNum == yearcomp)
    if(!transactionYear) {
      transactionYear = {yearNum: yearcomp, months: []}
      this.transactionsForYear.years.push(transactionYear)
    }
    let transactionsMonth: TransactionMonthInterface | undefined = transactionYear.months.find(month => month.monthNum == monthcomp)
    if(!transactionsMonth) {
      transactionsMonth = await this.setTransactionsForMonth(date, monthNum, justLoad);
      transactionYear.months.push(transactionsMonth)
    }
    if(!justLoad) {
      this.currMonth = transactionsMonth;
    }
  }
}


export interface TransactionsInterface {
  years: TransactionsYearInterface[];
}

export interface TransactionsYearInterface {
  yearNum: number;
  months: TransactionMonthInterface[]
}
export interface TransactionMonthInterface {
  name?: string;
  monthNum: number;
  transactions: Observable<DocumentData[]>;
  totalAmount: number;
  totalTransactions: number;
  categoryAmounts: Map<string, number>;
  accountAmounts: Map<string, number>;
}