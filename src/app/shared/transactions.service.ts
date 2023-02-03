import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, query, orderBy, limit, writeBatch, DocumentReference, getDoc, runTransaction, where, DocumentSnapshot, updateDoc, DocumentData } from '@angular/fire/firestore';
import { FormArray } from '@angular/forms';
import { AuthorisationService } from './../authorisation.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  
  transCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/transactions');
  itemsCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/items');
  constructor(private fs: Firestore, private auth: AuthorisationService) { }

  async addTransaction(transactionForm: any, items:any): Promise<any> {
    return this.updateMonth(transactionForm.transactionDate, transactionForm.category, transactionForm.frequency, transactionForm.account, transactionForm.amount).then((res) => {
      if(res.code == 1) {
        return addDoc(this.transCol, transactionForm).then(transaction => {
          return this.addItems(items, transaction.id)
        });
      }
      console.error(res.message)
      return null
    });
  }
  
  addItems(items: FormArray, transactionId: string) {
    const batch = writeBatch(this.fs);
    const curritem = {
      transactionId: transactionId,
      item: null,
      amount: null
    }
    items.controls.forEach(item => {
      curritem.item = item.value.item;
      curritem.amount = item.value.amount;
      batch.set(doc(this.itemsCol), curritem);
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

  getTransactions(numberToLimit: number){
    const q = query(this.transCol, orderBy('transactionDate', 'desc'), limit(numberToLimit))
    return collectionData(q, {idField: 'id'})
  }

  getTransactionsForMonth(date: Date){
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth()+1, 0)
    const q = query(this.transCol, where('transactionDate', '>=', start), where('transactionDate', '<=', end))
    return collectionData(q, {idField: 'id'})
  }

  async getAmountForMonth(date: Date): Promise<DocumentData | null> {
    const month = date.toLocaleString('en-GB',{month:'long'})
    const year = date.getFullYear()
    const monthRef = doc(this.fs,`users/${this.auth.getUserId()}/${year}/${month}`)
    const monthSnap = await getDoc(monthRef)
    if(monthSnap.exists()){
      return [monthSnap.data() as DocumentData]
    }
    return null;
  }

  async updateTransaction(id: string, transaction: any) {
    const transactionRef = doc(this.transCol, id)
    await updateDoc(transactionRef, transaction)
  }

  async deleteTransaction(transactionId: string, amount: number, account: string, category: string, date: Date, frequency : string) {
    const items = this.getItems(transactionId);
    const year = date.getFullYear();
    const month = date.toLocaleString('en-GB', {month: 'long'});

    items.forEach((data) => {
      if(data[0]) {
        deleteDoc(doc(this.itemsCol,data[0].id))
      }
    });
    
    this.updateMonth(date, category, frequency, account, 0 - amount)
    return deleteDoc(doc(this.transCol, transactionId))
  }

  getItems(transactionId:string) {
    const q = query(this.itemsCol, where('transactionId', '==', transactionId))
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
        if (!monthDoc.exists()) {
          message = 'Adding new month'
          let monthData = {}
          let nonAddedFreq = frequency == 'Monthly' ? 'Annually' : 'Monthly'
          if(category == 'bills'){
            monthData = {amount:amount, [category]: {[frequency]: amount, [nonAddedFreq]: 0}, [account]: amount}
          } else {
            monthData = {amount:amount, [category]: amount, [account]: amount, bills: {Monthly: 0, Annually: 0}}
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
}
