import { Injectable } from '@angular/core';
import { collection, collectionData, addDoc, Firestore, doc  } from '@angular/fire/firestore';
import { runTransaction } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { AuthorisationService } from '../authorisation.service';
import { Pot } from '../dashboard/savings/pots.interface';

@Injectable({
  providedIn: 'root'
})
export class SavingsService {

  constructor(private fs: Firestore ,private auth: AuthorisationService) { }

  addPot(accountId: String, potForm: any) {
    const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+accountId+'/pots');
    addDoc(potCollection, potForm)
  }

  getPots(accountId: String): Observable<Pot[]> {
    const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+accountId+'/pots');
    return collectionData(potCollection, {idField: 'id'}) as Observable<Pot[]>
  }

  async updatePot(potId: String, accountId: String, updAmount: Number) {
    const potRef = doc(this.fs,`users/${this.auth.getUserId()}/Accounts/${accountId}/pots/${potId}`)
    const accRef = doc(this.fs,`users/${this.auth.getUserId()}/Accounts/${accountId}`)
    try {
      await runTransaction(this.fs, async(transaction) => {
        const potDoc = await transaction.get(potRef)
        const accDoc = await transaction.get(accRef)
        let potAmount = Number((potDoc.data()?.amount + updAmount).toFixed(2))
        let accAmount = Number((accDoc.data()?.amount + updAmount).toFixed(2))
        transaction.update(potRef, {amount: potAmount})
        transaction.update(accRef, {amount: accAmount})
      })
      return 1
    } catch {
      return 0
    }
  }
}
