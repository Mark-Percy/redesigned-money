import { Component, Inject, OnInit } from '@angular/core';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Pot } from '../pots.interface';
import { Account } from '../../../user/account/account.interface';
import { AccountsService } from 'src/app/shared/accounts.service';
import { SavingsService } from 'src/app/shared/savings.service';
import { Status } from 'src/app/shared/Status.interface';

import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-savings-dialog',
  templateUrl: './savings-dialog.component.html',
  styleUrls: ['./savings-dialog.component.css']
})
export class SavingsDialogComponent {

  accountId: string;
  accountData:Promise<DocumentSnapshot<Account>>
  account: Account = {name: '', type: ''}
  showAddPot: boolean = false;
  transfer = false

  potsBetween: Pot[] = []

  columns = ['name', 'amount']
  pots: Observable<Pot[]>; 
  name: FormControl = this.fb.control('');


  transferVal: FormControl<number | null> = this.fb.control(0)

  constructor(
    @Inject(MAT_DIALOG_DATA) public id: string,
    private accountsService: AccountsService,
    private savingsService: SavingsService,
    public fb: FormBuilder,
    private _snackBar: MatSnackBar
  ) {
    this.accountId = id
    this.accountData = this.accountsService.getAccount(id)
    this.accountData.then((response) => {
      this.account = response.data() as Account
    })
    this.pots = this.savingsService.getPots(this.accountId);
  }

  addPot() {
    if(this.accountId) this.savingsService.addPot(this.accountId, this.name.value);
    this.showAddPot = false
  }

  enableAddPot() {
    this.transfer = false;
    this.showAddPot = !this.showAddPot;
  }

  enableTransfer() {
    this.transfer = !this.transfer;
    let message = `Transfer ${this.transfer ? 'enabled' : 'disabled'}`
    this.showAddPot = false;
    this.potsBetween = []
    this._snackBar.open(message, undefined, {horizontalPosition: 'right', verticalPosition: 'top',duration: 5000});
  }

  addToTransfer(pot: Pot) {
    if(!this.transfer) return
    this.potsBetween.push(pot)
    if(this.potsBetween.length == 3) this.potsBetween.shift()
    while(this.potsBetween[0].amount == 0) this.potsBetween.shift() 
  }

  transferValue() {
    let result: Status | null = null
    if(this.transferVal.value && this.accountId) result = this.savingsService.updatePotsAmounts(this.accountId, this.potsBetween, this.transferVal.value)
    this.potsBetween = []
    this.transferVal.patchValue(0)
    let message: string = '';
    if(result) {
      message = result.msg
    } else {
      message = 'Result Failed to be retrieved'
    }
    this._snackBar.open(message, undefined, {horizontalPosition: 'right', verticalPosition: 'top',duration: 5000})
  }
}
