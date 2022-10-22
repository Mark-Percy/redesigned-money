import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AuthorisationService } from 'src/app/authorisation.service';
import { TransAccountService } from 'src/app/trans-account.service';
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

  accounts: Observable<Account[]> = this.tras.getAccounts();

  constructor(private authService: AuthorisationService, private fb: FormBuilder, private dialog: MatDialog, private tras: TransAccountService) {
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

  openAddAccount(){
    const addAccountDialog = this.dialog.open(AddAccountDialog)
  }
  updateDisplayName() {
    this.authService.updateDisplayName(this.userDetailsForm.get('displayName')?.value);
  }

  getAccounts() {
    this.tras.getAccounts();
  }

  deleteAccount(id: string) {
    this.tras.delete(id)
  }
}

@Component({
  selector: 'add-account',
  template:`
  <h3 mat-dialog-title></h3>
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
      <button mat-raised-button>Submit</button>
    </form>
  </div>
  `
})
export class AddAccountDialog {

  accountTypes:string[] = ['Credit', 'Debit', 'Savings'];
  accountForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<AddAccountDialog>, private fb: FormBuilder, private tras: TransAccountService){
    this.accountForm = this.fb.group({
      name: [''],
      type: ['']
    })
  }
  
  submitAccount(){
    this.dialogRef.close();
    this.tras.addAccount(this.accountForm.value);
  }

}