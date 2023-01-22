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

  async addTransaction(transactionForm: any): Promise<DocumentReference> {
    const date = transactionForm.transactionDate;
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' })
    const monthDocRef= doc(this.fs,`users/${this.auth.getUserId()}/${year}/${month}`)
    const category = transactionForm.category
    const account = transactionForm.account
    try {
      await runTransaction(this.fs, async(transaction) => {
        const monthDoc = await transaction.get(monthDocRef);
        if (!monthDoc.exists()) {
          let monthData = {}
          let nonAddedFreq = transactionForm.frequency == 'Monthly' ? 'Annually' : 'Monthly'
          if(category == 'bills'){
            monthData = {amount:transactionForm.amount, [category]: {[transactionForm.frequency]: transactionForm.amount, [nonAddedFreq]: 0}, [account]: transactionForm.amount}
          } else {
            monthData = {amount:transactionForm.amount, [category]: transactionForm.amount, [account]: transactionForm.amount, bills: {Monthly: 0, Annually: 0}}
          }
          transaction.set(monthDocRef,monthData)
        } else {
          const newAmount = Number((monthDoc.data().amount + transactionForm.amount).toFixed(2))
          let categoryAmount = 0
          if(category == 'bills'){
            let bills = monthDoc.get(category)
            bills[transactionForm.frequency] = Number((bills[transactionForm.frequency] + transactionForm.amount).toFixed(2))
            categoryAmount = bills
          } else {
            categoryAmount = Number(monthDoc.get(category) ? (monthDoc.get(category) +  transactionForm.amount).toFixed(2) : transactionForm.amount)
          }
          const accountAmount = Number(monthDoc.get(account) ? (monthDoc.get(account) +  transactionForm.amount).toFixed(2) : transactionForm.amount)
          
          transaction.update(monthDocRef, {amount: newAmount, [category]: categoryAmount, [account]: accountAmount})
        }
      });
    } catch (e:any) {
      console.error(e.message)
    }
    return addDoc(this.transCol, transactionForm)
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

    return batch.commit();
  }

  getTransactions(numberToLimit: number){
    const q = query(this.transCol, orderBy('transactionDate', 'desc'), limit(numberToLimit))
    return collectionData(q, {idField: 'id'})
  }

  getTransactionsForMonth(date: Date) {
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

  async deleteTransaction(transactionId: string, amount: number, account: string, category: string, date: Date, frequency? : string) {
    const items = this.getItems(transactionId);
    const year = date.getFullYear();
    const month = date.toLocaleString('en-GB', {month: 'long'});
    const monthDocRef= doc(this.fs,`users/${this.auth.getUserId()}/${year}/${month}`);

    items.forEach((data) => {
      if(data[0]) {
        deleteDoc(doc(this.itemsCol,data[0].id))
      }
    })
    try {
      await runTransaction(this.fs, async(transaction) => {
        const monthDoc = await transaction.get(monthDocRef);
        const newAmount = Number((monthDoc.get('amount') - amount).toFixed(2))
        const accountAmount = Number((monthDoc.get(account) - amount).toFixed(2))
        let categoryAmount;

        if(category == 'bills' && frequency) {
          categoryAmount = monthDoc.get('bills')
          categoryAmount[frequency] = Number((categoryAmount[frequency] - amount).toFixed(2))
        } else {
          categoryAmount = Number((monthDoc.get(category) - amount).toFixed(2))
        }
        transaction.update(monthDocRef, {amount: newAmount, [category]: categoryAmount, [account]: accountAmount})
      })
    } catch (e: any) {
      console.error(e.message)
    }
    return deleteDoc(doc(this.transCol, transactionId))
  }

  getItems(transactionId:string) {
    const q = query(this.itemsCol, where('transactionId', '==', transactionId))
    return collectionData(q, {idField: 'id'})
  }
}
