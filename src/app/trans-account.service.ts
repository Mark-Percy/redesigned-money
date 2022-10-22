import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, query, orderBy, limit, writeBatch, DocumentReference } from '@angular/fire/firestore';
import { FormArray } from '@angular/forms';
import { Timestamp, where } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { AuthorisationService } from './authorisation.service';
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
    addDoc(this.collection, accountsForm);
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

  delete(id: string) {
    deleteDoc(doc(this.collection, id))
  }

  addTransaction(transactionForm: any): Promise<DocumentReference> {
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
}
