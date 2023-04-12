import { Injectable } from '@angular/core';
import { collection, collectionData, addDoc, Firestore, doc  } from '@angular/fire/firestore';
import { runTransaction } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { AuthorisationService } from '../authorisation.service';
import { Pot } from '../dashboard/savings/pots.interface';
import { Status } from './Status.interface';

@Injectable({
  providedIn: 'root'
})
export class SavingsService {

  constructor(private fs: Firestore ,private auth: AuthorisationService) { }

  addPot(accountId: String, potForm: Pot) {
    const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+accountId+'/pots');
    addDoc(potCollection, potForm)
  }

  getPots(accountId: String): Observable<Pot[]> {
    const potCollection = collection(this.fs, 'users/'+this.auth.getUserId()+'/Accounts/'+accountId+'/pots');
    return collectionData(potCollection, {idField: 'id'}) as Observable<Pot[]>
  }

  async updatePot(potId: String, accountId: String, updAmount: Number, betweenPots?: boolean): Promise<Status> {
    const potRef = doc(this.fs,`users/${this.auth.getUserId()}/Accounts/${accountId}/pots/${potId}`)
    const accRef = doc(this.fs,`users/${this.auth.getUserId()}/Accounts/${accountId}`)
    try {
      await runTransaction(this.fs, async(transaction) => {
        const potDoc = await transaction.get(potRef)
        const accDoc = await transaction.get(accRef)
        let potAmount:number = Number((potDoc.data()?.amount + updAmount).toFixed(2))
        let accAmount: number = Number((accDoc.data()?.amount + updAmount).toFixed(2))
        transaction.update(potRef, {amount: potAmount})
        if(!betweenPots) transaction.update(accRef, {amount: accAmount})
      })
      return {status: 'Success', msg: 'Value updated successfully'}
    } catch (e){
      console.error(e)
      return {status: 'Error', msg: 'Error updating pot'}
    }
  }

  updatePotsAmounts(accountId: String, pots: Pot[], amount:number): Status {
    let allGood = true
    if(pots.length > 2) return {status: 'Error', msg: 'number of pots passed through was greater than the 2 expected'}
    for(let [i, pot] of pots.entries()) {
      if(allGood) {
        let transAmount = i == 0 ? 0 - amount : amount
        if(pot.id) this.updatePot(pot.id, accountId, transAmount, true).then((val) => {allGood = val.status == 'Success'})
      }
    }
    return {status: 'Success', msg: 'Both Pot amounts were updated'}

  }
}
