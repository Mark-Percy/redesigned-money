import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, DocumentSnapshot, Firestore, getDoc, getDocs, orderBy, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthorisationService } from '../authorisation.service';
import { Account } from '../user/account/account.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  accounts = this.setAccounts();;

  constructor(private fs: Firestore, private auth: AuthorisationService) {}

  addAccount(accountsForm: Account) {
    const accountsCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts');
    let newDoc = addDoc(accountsCol, accountsForm);
    if(accountsForm.type == 'Savings'){
      newDoc.then((response) => {
        const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+response.id+'/pots')
        addDoc(potCollection, {name: 'Main', amount: accountsForm.amount})
      })
    }
  }

  getAccounts(accountType?: string): Observable<Account[]> {
    const accountsCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts');
    let q;
    if(!accountType) {
      q = query(accountsCol, orderBy('name'))
    } else {
      q = query(accountsCol, orderBy('name'), where('type', '==', accountType))
    }
    return collectionData(q, {idField: 'id'}) as  Observable<Account[]>
  }
  
  getAccountsStatic(accountType?: string, remove?: boolean) {
    const accountsCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts');
    let q;
    if(!accountType) {
      q = query(accountsCol, orderBy('name'))
    } else if(!remove) {
      q = query(accountsCol, orderBy('name'), where('type', '==', accountType))
    } else q = query(accountsCol, where('type', '!=', accountType))
    return getDocs(q) 
  }

  getAccount(id: string) : Promise<DocumentSnapshot<Account>>{
    const accountsCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts');
    return getDoc(doc(accountsCol, id)) as Promise<DocumentSnapshot<Account>>
  }

  delete(id: string) {
    const accountsCol = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts');
    deleteDoc(doc(accountsCol, id))
  }
  //Note tidy up this function maybe develop it further to add other attributes
  setAccounts() {
    const accounts = this.getAccounts()
    const accountsMap = new Map()
    accounts.forEach(accounts => {
      accounts.forEach(account => {
        accountsMap.set(account.id, account.name)
      })
    })
    return accountsMap
  }

  getAccountName(id: string): string {
    return this.accounts.get(id)
  }
}
