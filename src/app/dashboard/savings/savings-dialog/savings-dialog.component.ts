import { Component, Inject, OnInit } from '@angular/core';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Pot } from '../pots.interface';
import { Account } from '../../../user/account/account.interface';
import { AccountsService } from 'src/app/shared/accounts.service';
import { SavingsService } from 'src/app/shared/savings.service';

@Component({
  selector: 'app-savings-dialog',
  templateUrl: './savings-dialog.component.html',
  styleUrls: ['./savings-dialog.component.css']
})
export class SavingsDialogComponent {

  accountId: String;
  accountData:Promise<DocumentSnapshot<Account>>
  account: Account = {name: '', type: ''}
  showAddPot: boolean = false;

  potsBetween: Pot[] = []

  columns = ['name', 'amount']
  pots: Observable<Pot[]>; 
  addPotsForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    amount: 0
  });


  transferVal: FormControl<number | null> = this.fb.control(0)

  constructor(
    @Inject(MAT_DIALOG_DATA) public id: string,
    private accountsService: AccountsService,
    private savingsService: SavingsService,
    public fb: FormBuilder
  ) {
    this.accountId = id
    this.accountData = this.accountsService.getAccount(id)
    this.accountData.then((response) => {
      this.account = response.data() as Account
    })
    this.pots = this.savingsService.getPots(this.accountId);
  }

  addPot() {
    if(this.accountId) this.savingsService.addPot(this.accountId, this.addPotsForm.value);
    this.showAddPot = false
  }

  addToTransfer(pot: Pot) {
    this.potsBetween.push(pot)
    if(this.potsBetween.length == 3) this.potsBetween.shift()
    while(this.potsBetween[0].amount == 0) this.potsBetween.shift() 
  }

  transferValue() {
    if(this.transferVal.value && this.accountId) this.savingsService.updatePotsAmounts(this.accountId, this.potsBetween, this.transferVal.value)
    this.potsBetween = []
  }
}
