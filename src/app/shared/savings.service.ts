import { Injectable } from '@angular/core';
import { collection, collectionData, addDoc, Firestore  } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthorisationService } from '../authorisation.service';
import { Pot } from '../dashboard/savings/pots.interface';

@Injectable({
  providedIn: 'root'
})
export class SavingsService {

  constructor(private fs: Firestore ,private auth: AuthorisationService) { }

  addPot(potId: string, potForm: any) {
    const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+potId+'/pots');
    addDoc(potCollection, potForm)
  }

  getPots(potId: string) {
    const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+potId+'/pots');
    return collectionData(potCollection, {idField: 'id'}) as Observable<Pot[]>
  }
}
