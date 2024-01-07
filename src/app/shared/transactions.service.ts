import { Injectable, OnInit } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, query, orderBy, limit, writeBatch, getDoc, runTransaction, where, updateDoc, DocumentData, getAggregateFromServer, count, sum } from '@angular/fire/firestore';
import { FormArray } from '@angular/forms';
import { TransactionInterface } from '../add-transaction/add-transaction.component';
import { Amount } from "./amount";
import { AuthorisationService } from './../authorisation.service';
import { SavingsService } from './savings.service';
import { Account } from '../user/account/account.interface';
import { AccountsService } from './accounts.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  accounts: Account[];
  numberOfTransactions: number = 0;
  sumOfAmounts: number = 0;
  transactions: Observable<DocumentData[]>;
  categoryAmounts = new Map();
  accountAmounts = new Map();

  constructor(private fs: Firestore, private auth: AuthorisationService, private savingsService: SavingsService, private accountsService: AccountsService) {
    this.accountsService.getAccounts().subscribe(data => {
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
        this.numberOfTransactions += 1
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
    this.transactions = collectionData(q, {idField: 'id'})
  }

  setTransactionsForMonth(date: Date): void{
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
    snap.then(data => {
      this.numberOfTransactions = data.data().countOfDocs;
      this.sumOfAmounts = data.data().sumOfAmounts;
    })
    this.transactions = collectionData(q, {idField: 'id'})
    this.setAmounts()
  }

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
      this.updateMonth(date, category, frequency, account, 0 - amount)
    }
    deleteDoc(doc(transCol, transactionId)).then(() => {
      this.numberOfTransactions -= 1
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
        this.sumOfAmounts = Number((this.sumOfAmounts + amount).toFixed(2))
        const accounts = this.accountsService.getAccounts()
        const accountsMap = new Map()
        accounts.forEach(docs => {
          docs.forEach(doc => {
            accountsMap.set(doc.id, doc.name)
          })
        })
        this.setSubAmounts(category, account, amount, accountsMap, frequency);
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

  setAmounts(){
    const accounts = this.accountsService.getAccounts()
    const accountsMap = new Map()
    accounts.forEach(docs => {
      docs.forEach(doc => {
        accountsMap.set(doc.id, doc.name)
      })
    })
    this.transactions.forEach(docs => {
      this.categoryAmounts = new Map();
      this.accountAmounts = new Map();
      docs.forEach(doc => {
        this.setSubAmounts(doc.category, doc.account, doc.amount, accountsMap, doc.frequency);
      });
    });
  }

  setSubAmounts(category: string, account:string, amount: number, accountsMap: Map<string,number>, frequency: string) {
    const accountAmounts = this.accountAmounts
    const categoryAmounts = this.categoryAmounts
    if(!categoryAmounts.has(category) && category != 'bills') categoryAmounts.set(category, amount);
    else if(category == 'bills'){
      if(!categoryAmounts.has(frequency)) categoryAmounts.set(frequency, amount);
      else categoryAmounts.set(frequency, Number((categoryAmounts.get(frequency) + amount).toFixed(2)));
    }
    else categoryAmounts.set(category, Number((categoryAmounts.get(category) + amount).toFixed(2)));

    if(!accountAmounts.has(accountsMap.get(account))) accountAmounts.set(accountsMap.get(account), amount);
    else accountAmounts.set(accountsMap.get(account), Number((accountAmounts.get(accountsMap.get(account)) + amount).toFixed(2)));
  }
}
