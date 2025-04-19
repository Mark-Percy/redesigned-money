import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { AuthorisationService } from 'src/app/authorisation.service';
import { Account } from '../account/account.interface';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { AccountComponent } from '../account/account.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { MatInput } from '@angular/material/input';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { AccountsServiceV2 } from 'src/app/shared/services/accounts.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatGridList,
    MatGridTile,
    MatFormField,
    MatLabel,
    MatInput,
    MatIconButton,
    MatSuffix,
    MatIcon,
    AccountComponent,
    AsyncPipe,
  ],
})
export class ProfileComponent implements OnInit, OnDestroy {
  public accounts: Account[] = [];

  userDetailsForm = this.fb.group({
    email: [this.authService.user?.email],
    displayName: [
      {
        value: this.authService.user ? this.authService.user.displayName : null,
        disabled: this.hasDisplayName(),
      },
    ],
    firstName: [''],
    surname: [''],
  });

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private authService: AuthorisationService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private accountsService: AccountsServiceV2,
  ) {
    this.authService.getDetails().subscribe((data) => {
      if (data) {
        this.userDetailsForm.get('firstName')?.patchValue(data['firstName']);
        this.userDetailsForm.get('surname')?.patchValue(data['surname']);
      }
    });
  }

  ngOnInit(): void {
    this.accountsService.accounts$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((accounts: Account[]) => (this.accounts = accounts));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  verifyEmail() {
    this.authService.sendEmailVerification();
  }
  hasDisplayName() {
    return this.authService.hasDisplayName();
  }

  emailVerified() {
    return this.authService.user?.emailVerified;
  }

  openAddAccount(id?: string) {
    const addAccountDialog = this.dialog.open(AddAccountDialog, { data: id });
  }

  updateDisplayName() {
    this.authService.updateDisplayName(
      this.userDetailsForm.get('displayName')?.value,
    );
  }

  deleteAccount(id: string) {
    this.accountsService.deleteAccount(id);
  }
}

@Component({
  selector: 'add-account',
  template: `
    <h3 mat-dialog-title>{{ action }}</h3>
    <div mat-dialog-content>
      <form (ngSubmit)="submitAccount()" [formGroup]="accountForm">
        <mat-form-field>
          <mat-label>Account Name</mat-label>
          <input type="text" matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Type of Account</mat-label>
          <mat-select formControlName="type">
            @for (option of accountTypes; track $index) {
              <mat-option [value]="option">{{ option }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        @if (showNum) {
          <mat-form-field>
            <mat-label>Amount</mat-label>
            <input type="number" matInput formControlName="amount" />
          </mat-form-field>
        }
        <button mat-raised-button>Submit</button>
      </form>
    </div>
  `,
  standalone: true,
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
  ],
})
export class AddAccountDialog {
  accountTypes: string[] = ['Credit', 'Debit', 'Savings'];
  accountForm: FormGroup;
  showNum: boolean = false;
  action = 'Add Account';

  constructor(
    public dialogRef: MatDialogRef<AddAccountDialog>,
    private fb: FormBuilder,
    private accountsService: AccountsServiceV2,
    @Inject(MAT_DIALOG_DATA) public id: string,
  ) {
    this.accountForm = this.fb.group({
      name: '',
      type: '',
      amount: 0,
    });
    if (id) {
      this.action = 'Edit Account';
      let account = this.accountsService.getAccount(id);
      if (account) {
        this.fb.group(account);
        this.showNum = account.type == 'Credit';
      }
    }
    this.accountForm.get('type')?.valueChanges.subscribe((val) => {
      this.showNum = val == 'Savings' || val == 'Credit';
    });
  }

  submitAccount() {
    this.dialogRef.close();
    if (this.id == undefined)
      this.accountsService.addAccount(this.accountForm.value);
  }
}
