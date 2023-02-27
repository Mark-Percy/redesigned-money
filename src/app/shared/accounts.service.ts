import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, DocumentSnapshot, Firestore, getDoc, orderBy, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthorisationService } from '../authorisation.service';
import { Account } from '../user/account/account.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  collection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts');

  constructor(private fs: Firestore, private auth: AuthorisationService) { }

  addAccount(accountsForm: Account) {
    let newDoc = addDoc(this.collection, accountsForm);
    if(accountsForm.type == 'Savings'){
      newDoc.then((response) => {
        const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+response.id+'/pots')
        addDoc(potCollection, {name: 'Main', amount: accountsForm.amount})
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

  delete(id: string) {
    deleteDoc(doc(this.collection, id))
  }
}
