import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, query, orderBy, limit, writeBatch, DocumentReference, getDoc } from '@angular/fire/firestore';
import { FormArray, FormGroup } from '@angular/forms';
import { DocumentSnapshot, where } from 'firebase/firestore';
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
    let newDoc = addDoc(this.collection, accountsForm);
    if(accountsForm.type == 'Savings'){
      newDoc.then((response) => {
        const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+response.id+'/pots')
        addDoc(potCollection, {name: 'Main', amount: 0})
      })
    }
  }

  addPot(potId: string, potForm: any) {
    const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+potId+'/pots');
    addDoc(potCollection, potForm)
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
