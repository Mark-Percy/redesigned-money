import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AuthorisationService } from 'src/app/authorisation.service';
import { AccountsService } from 'src/app/shared/accounts.service';
import { Account } from '../account/account.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userDetailsForm = this.fb.group({
    email: [this.authService.user?.email],
    displayName: [{value: this.authService.user ? this.authService.user.displayName : null , disabled: this.hasDisplayName()}],
    firstName : [''],
    surname : [''],
  })

  accounts: Observable<Account[]> = this.accountsService.getAccounts();

  constructor(private authService: AuthorisationService, private fb: FormBuilder, private dialog: MatDialog, private accountsService: AccountsService) {
    this.authService.getDetails().subscribe(data => {
      this.userDetailsForm.get('firstName')?.patchValue(data['firstName']);
      this.userDetailsForm.get('surname')?.patchValue(data['surname']);
    });
  }

  ngOnInit(): void {
  }

  verifyEmail() {
    this.authService.sendEmailVerification();
  }
  hasDisplayName(){
    return this.authService.hasDisplayName();
  }
  
  emailVerified() {
    return this.authService.user?.emailVerified
  }

  openAddAccount(id?: string){
    const addAccountDialog = this.dialog.open(AddAccountDialog, {data: id})
  }
  updateDisplayName() {
    this.authService.updateDisplayName(this.userDetailsForm.get('displayName')?.value);
  }

  getAccounts() {
    this.accountsService.getAccounts();
  }

  deleteAccount(id: string) {
    this.accountsService.delete(id)
  }
}

@Component({
  selector: 'add-account',
  template:`
  <h3 mat-dialog-title>{{ action }}</h3>
  <div mat-dialog-content>
    <form (ngSubmit)="submitAccount()" [formGroup]="accountForm">
      <mat-form-field>
        <mat-label>Account Name</mat-label>
        <input type="text" matInput formControlName="name">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Type of Account</mat-label>
        <mat-select formControlName="type">
          <mat-option *ngFor="let option of accountTypes" [value]="option">{{ option }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field *ngIf="showNum">
        <mat-label>Amount</mat-label>
        <input type="number" matInput formControlName="amount">
      </mat-form-field>
      <button mat-raised-button>Submit</button>
    </form>
  </div>
  `
})
export class AddAccountDialog {

  accountTypes:string[] = ['Credit', 'Debit', 'Savings'];
  accountForm: FormGroup;
  showNum: boolean = false;
  action = 'Add Account'

  constructor(public dialogRef: MatDialogRef<AddAccountDialog>,
    private fb: FormBuilder,
    private accountsService: AccountsService,
    @Inject(MAT_DIALOG_DATA) public id: string,
  ){
    this.accountForm = this.fb.group({
      name: '',
      type: '',
      amount: 0
    })
    if(id) {
      this.action = 'Edit Account'
      this.accountsService.getAccount(id).then(account => {
        const Acc: Account | undefined = account.data()
        if(Acc) this.accountForm = this.fb.group(Acc)
        this.showNum = Acc?.type == 'Credit'
      })
    }
    this.accountForm.get('type')?.valueChanges.subscribe((val) => {
      this.showNum = val == 'Savings' || val == 'Credit'
    })
  }
  
  submitAccount(){
    this.dialogRef.close();
    if(this.id == '') this.accountsService.addAccount(this.accountForm.value);
  }

}