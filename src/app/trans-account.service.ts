import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { AuthorisationService } from './authorisation.service';

@Injectable({
  providedIn: 'root'
})
export class TransAccountService {

  constructor(private fs: Firestore, private auth: AuthorisationService) { }

  addAccount(accountsForm: any) {
    const col = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts')
    addDoc(col, accountsForm);
  }
}
