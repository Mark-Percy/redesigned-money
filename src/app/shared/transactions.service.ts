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
      resCode = await this.updateMonth(transactionForm.transactionDate, transactionForm.category, transactionForm.frequency, accountName, transactionForm.amount).then((res) => {
        return res.code
      });
    }
    if(resCode == 1 || savings) {
      const transCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/transactions');
      return addDoc(transCol, transactionForm).then(transaction => {
        this.transactionsForYear.years[this.currYearInd].months[this.currMonthInd].totalTransactions += 1
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

  getTransactions(numberToLimit: number): Observable<DocumentData[]>{
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
    await this.setAmounts(month)
    return month
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
      accounts.pipe(take(1)).subscribe(docs => {
        docs.forEach(doc => {
          accountsMap.set(doc.id, doc.name)
        })
      })
      const accountToUse = accountsMap.get(account)
      if(accountToUse) this.updateMonth(date, category, frequency, accountToUse, 0 - amount)
    }
    deleteDoc(doc(transCol, transactionId)).then(() => {
      this.transactionsForYear.years[this.currYearInd].months[this.currMonthInd].totalTransactions -= 1
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
    const currMonth = this.transactionsForYear.years[this.currYearInd].months[this.currMonthInd]
    currMonth.totalAmount = Number((currMonth.totalAmount + amount).toFixed(2))
    this.setSubAmounts(category, account, amount, frequency, currMonth)
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
    transactionMonth.transactions?.pipe(take(1)).subscribe(docs => {
      docs.forEach(doc => {
        const account = accountsMap.get(doc.account)
        console.log('calling')
        this.setSubAmounts(doc.category, account, doc.amount, doc.frequency, transactionMonth);
      });
    });
  }

  setSubAmounts(category: string, account:string, amount: number, frequency: string, transactionMonth: TransactionMonthInterface) {
    //Categories
    console.log(`setSubAmounts: ${category}, ${account}, ${amount}`)
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
    let ret = {success: false, indexes: {year: -1}}
    for (let i = 0; i < 12; i++) {
      date.setMonth(i);
      ret = await this.setCurrentMonth(date, true, i)
    }
    return {finished: true, transactionsForYear: this.transactionsForYear.years[ret.indexes.year]}
  }

  async setCurrentMonth(date: Date, justLoad: boolean, monthNum: number) {
    const yearcomp: number = date.getFullYear()
    const monthcomp = justLoad ? monthNum : date.getMonth()

    let transactionYear: TransactionsYearInterface | undefined  = this.transactionsForYear.years.find(year => year.yearNum == yearcomp)
    let transactionYearIndex: number | undefined  = this.transactionsForYear.years.findIndex(year => year.yearNum == yearcomp)
    if(!transactionYear) {
      transactionYear = {yearNum: yearcomp, months: []}
      this.transactionsForYear.years.push(transactionYear)
    }
    let transactionsMonth: TransactionMonthInterface | undefined = transactionYear.months.find(month => month.monthNum == monthcomp)
    if(!transactionsMonth) {
      transactionsMonth = await this.setTransactionsForMonth(date, monthNum, justLoad);
      transactionYear.months.push(transactionsMonth)
    }
    const yearInd = this.transactionsForYear.years.findIndex(year => year.yearNum == date.getFullYear())
    const monthInd = this.transactionsForYear.years[yearInd].months.findIndex(month => month.monthNum == date.getMonth())
    if(!justLoad) {
      console.log(yearInd)
      console.log(monthInd)
      this.currYearInd = yearInd
      this.currMonthInd = monthInd
    }
    
    return {success: true, indexes: {year: transactionYearIndex, month: monthInd}}
  }

  setMonthLimit(num: number) {
    const ind = this.transactionsForYear.years.findIndex(year => year.yearName == 'limited')
    console.log(ind)
    if(ind == -1){

      const currMonth: TransactionMonthInterface = {
        monthNum: 0,
        name: 'limited',
        transactions: this.getTransactions(num),
        accountAmounts: new Map(),
        categoryAmounts: new Map(),
        totalAmount: 0,
        totalTransactions: 0,
      }
      const currYear: TransactionsYearInterface = {
        yearName: 'limited',
        months: [currMonth]
      }
      this.transactionsForYear.years.push(currYear)
      this.currYearInd = this.transactionsForYear.years.length -1
    } else {
      this.currYearInd = ind
    }
    this.currMonthInd = 0
    console.log(this.transactionsForYear)
  }

  async getCurrMonth(date: Date) {
    const dat =  await this.setCurrentMonth(date, false, -1)
    return this.transactionsForYear.years[this.currYearInd].months[this.currMonthInd]
  }

  getCurrTransactions(year: number, month: number): Observable<DocumentData[]> {
    if(year == -1 && month == -1) return this.getTransactions(5)
    const transactions = this.transactionsForYear.years[year].months[month].transactions
    if(transactions) return transactions
    return this.getTransactions(1)
  }

  getMonthIndexes(date: Date): {yearIndex: number, monthIndex: number} {
    const yearIndex: number = this.transactionsForYear.years.findIndex(year => year.yearNum == date.getFullYear()) 
    const monthIndex: number = this.transactionsForYear.years[yearIndex].months.findIndex(month => month.monthNum == date.getMonth()) 
    return {yearIndex: yearIndex, monthIndex: monthIndex}
  } 
}


export interface TransactionsInterface {
  years: TransactionsYearInterface[];
}

export interface TransactionsYearInterface {
  yearNum?: number;
  yearName?: string
  months: TransactionMonthInterface[]
}
export interface TransactionMonthInterface {
  name?: string;
  monthNum: number;
  transactions?: Observable<DocumentData[]>;
  totalAmount: number;
  totalTransactions: number;
  categoryAmounts: Map<string, number>;
  accountAmounts: Map<string, number>;
}