import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, query, orderBy, limit, writeBatch, DocumentReference, getDoc, runTransaction, where, DocumentSnapshot, updateDoc } from '@angular/fire/firestore';
import { FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthorisationService } from './authorisation.service';
import { Pot } from './dashboard/savings/pots.interface';
import { Account } from './user/account/account.interface';

@Injectable({
  providedIn: 'root'
})
export class TransAccountService {
  
  transCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/transactions');
  itemsCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/items');
  collection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts');
  constructor(private fs: Firestore, private auth: AuthorisationService) { }

  addAccount(accountsForm: any) {
    let newDoc = addDoc(this.collection, accountsForm);
    if(accountsForm.type == 'Savings'){
      newDoc.then((response) => {
        const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+response.id+'/pots')
        addDoc(potCollection, {name: 'Main', amount: 0})
      })
    }
  }

  getAccounts(accountType?: string): Observable<Account[]> {
    let q;
    if(!accountType) {
      q = query(this.collection, orderBy('name'))
    } else {
      q = query(this.collection, orderBy('name'), where('type', '==', accountType))
    }
    return collectionData(q, {idField: 'id'}) as  Observable<Account[]>
  }

  getAccount(id: string) : Promise<DocumentSnapshot<Account>>{
    return getDoc(doc(this.collection, id)) as Promise<DocumentSnapshot<Account>>
  }

  addPot(potId: string, potForm: any) {
    const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+potId+'/pots');
    addDoc(potCollection, potForm)
  }

  getPots(potId: string) {
    const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+potId+'/pots');
    return collectionData(potCollection, {idField: 'id'}) as Observable<Pot[]>
  }
  
  delete(id: string) {
    deleteDoc(doc(this.collection, id))
  }

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
          transaction.set(monthDocRef,{amount:transactionForm.amount, [category]: transactionForm.amount, [account]: transactionForm.amount})
        } else {
          const newAmount = monthDoc.data().amount + transactionForm.amount
          const categoryAmount = monthDoc.get(category) ? monthDoc.get(category) +  transactionForm.amount : transactionForm.amount
          const accountAmount = monthDoc.get(account) ? monthDoc.get(account) +  transactionForm.amount : transactionForm.amount
          
          transaction.update(monthDocRef, {amount: newAmount, [category]: categoryAmount, [account]: accountAmount})
        }
      });
    } catch {
      console.log('Transaction failed')
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

    batch.commit();
  }

  getTransactions(numberToLimit: number){
    const q = query(this.transCol, orderBy('transactionDate', 'desc'), limit(numberToLimit))
    return collectionData(q, {idField: 'id'})
  }

  getTransactionsForMonth(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth()+1, 0)
    const q = query(this.transCol, where('transactionDate', '>', start), where('transactionDate', '<', end))
    return collectionData(q, {idField: 'id'})
  }

  async getAmountForMonth(month: string, year: number): Promise<number> {
    const monthRef = doc(this.fs,`users/${this.auth.getUserId()}/${year}/${month}`)
    const monthSnap = await getDoc(monthRef)
    if (monthSnap.exists()) {
      return monthSnap.data().amount;
    }
    return 0;
  }
  async updateTransaction(id: string, transaction: any) {
    const transactionRef = doc(this.transCol, id)
    await updateDoc(transactionRef, transaction)
  }
}
