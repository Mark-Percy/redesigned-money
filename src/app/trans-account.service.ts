import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthorisationService } from './authorisation.service';
import { Account } from './user/account/account.interface';

@Injectable({
  providedIn: 'root'
})
export class TransAccountService {
  
  collection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts');
  constructor(private fs: Firestore, private auth: AuthorisationService) { }

  addAccount(accountsForm: any) {
    addDoc(this.collection, accountsForm);
  }

  getAccounts(): Observable<Account[]> {
    const q = query(this.collection, orderBy('name'))
    return collectionData(q, {idField: 'id'}) as  Observable<Account[]>
  }
  delete(id: string) {
    deleteDoc(doc(this.collection, id))
  }
}
