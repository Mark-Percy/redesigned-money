import { Component, Inject, OnInit } from '@angular/core';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Pot } from '../pots.interface';
import { TransAccountService } from '../../../trans-account.service';
import { Account } from '../../../user/account/account.interface';

@Component({
  selector: 'app-savings-dialog',
  templateUrl: './savings-dialog.component.html',
  styleUrls: ['./savings-dialog.component.css']
})
export class SavingsDialogComponent {

  accountData:Promise<DocumentSnapshot<Account>>
  account: Account = {name: '', type: ''}
  showAddPot: boolean = false;

  columns = ['name', 'amount']
  pots: Observable<Pot[]>; 
  addPotsForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    amount: '0'
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public id: string,
    public tras: TransAccountService,
    public fb: FormBuilder
  ) {
    this.account.id = id;
    this.accountData = this.tras.getAccount(id)
    this.accountData.then((response) => {
      this.account.name = response.get('name');
      this.account.type = response.get('type');
    })

    this.pots = this.tras.getPots(this.account.id);
  }

  addPot() {
    if(this.account.id) this.tras.addPot(this.account.id, this.addPotsForm.value);
  }
}
