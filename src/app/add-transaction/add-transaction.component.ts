import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MatOption } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Pot } from '../dashboard/savings/pots.interface';
import { AccountsService } from '../shared/accounts.service';
import { SavingsService } from '../shared/savings.service';
import { TransactionsService } from '../shared/transactions.service';
import { Account } from '../user/account/account.interface';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatHint, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { TransactionsTableComponent } from '../transactions-table/transactions-table.component';


export interface TransactionInterface {
  id: string;
  transactionDate: Date;
  date: Date;
  account: string;
  toAccount: string;
  pot: string;
  category: string;
  location: string;
  amount: number | null;
  frequency: string;
  items: [{
    item: string,
    amount: number
  }] | [];
}
export class Savings {
  name: string;
  id: string;
  amount: number | null;
  constructor (account: Account, savingsService: SavingsService){
    this.name = account.name;
    this.id = account.id ? account.id : 'empty';
    this.amount = account.amount ? account.amount : 0;
  }
}

@Component({
    selector: 'app-add-transaction',
    templateUrl: './add-transaction.component.html',
    styleUrls: ['./add-transaction.component.css'],
    standalone: true,
    imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatSlideToggle,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatHint,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatSelect,
    MatOption,
    MatPrefix,
    MatButton,
    MatIcon,
    AsyncPipe,
    TransactionsTableComponent
]
})
export class AddTransactionComponent implements OnInit {

  similarTransactions: Observable<TransactionInterface[]>;
  addingMultiple: FormControl = new FormControl(false)
  keepAccount: FormControl = new FormControl({value: false, disabled: true})
  submitting: boolean = false

  ngOnInit(): void {
  }
  transactionForm: FormGroup;
  accounts: Observable<Account[]>
  accountsArr:Account[] = [];
  pots: Observable<Pot[]>
  numberOfItems: number = 1;
  items: FormArray;
  formPrefill: TransactionInterface = {
    transactionDate: new Date(),
    id: '',
    date: new Date(),
    account: '',
    toAccount: '',
    pot: '',
    category: '',
    location: '',
    amount: null,
    frequency: '',
    items: []
  }
  oldTransaction: TransactionInterface = {
    transactionDate: new Date(),
    id: '',
    date: new Date(),
    account: '',
    toAccount: '',
    pot: '',
    category: '',
    location: '',
    amount: null,
    frequency: '',
    items: []
  }
  showFreq: boolean = false;
  update: boolean = false;
  savings: boolean = false;

  
  constructor(
    private fb: FormBuilder,
    private transactionDialog: MatDialogRef<AddTransactionComponent>,
    private _adapter: DateAdapter<any>,
    private transactionsService: TransactionsService,
    private accountsService: AccountsService,
    private savingsService: SavingsService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: {date?: Date, row:TransactionInterface | null
  }  
  ){
    if(this.data && this.data.row) {
      this.formPrefill = this.data.row;
      this.showFreq = this.formPrefill.category == 'bills';
      this.savings = this.formPrefill.category == 'savings';
      this.update = true;
    }
    this.formPrefill.date = this.data && this.data.date ? this.data.date : this.formPrefill.date;
    this._adapter.setLocale('en-GB');

    this.accounts = this.accountsService.getAccounts();
    this.transactionForm = this.fb.group({
      transactionDate: this.formPrefill.date,
      account: this.formPrefill.account,
      toAccount: this.formPrefill.toAccount,
      pot: this.formPrefill.pot,
      category: this.formPrefill.category,
      frequency: this.formPrefill.frequency,
      location: this.formPrefill.location,
      amount: this.formPrefill.amount,
      items: this.fb.array([
      ])
    })

    this.transactionForm.get('category')?.valueChanges.subscribe((val) => {
      this.showFreq = val == 'bills';
      this.savings = val == 'savings';
    })
    this.transactionForm.get('toAccount')?.valueChanges.subscribe((val) => {
      this.pots = this.savingsService.getPots(val);
    })

    this.items = this.getItems();
    this.formPrefill.items.forEach(data => {
      this.addItem(data.item, data.amount);
    });

    this.transactionDialog.afterClosed().subscribe(ref => {
      this.router.navigate([], {
        queryParams: {
          addNewTransaction:null
        },
        queryParamsHandling: 'merge'
      })
    });

    this.items.valueChanges.subscribe(items => {
      let sum:number = 0;
      for(let i in items) {
        sum += items[i].amount;
      }
      this.transactionForm.get('amount')?.patchValue(sum)
    });

    this.accounts.subscribe((ret) => {
      this.accountsArr = ret;
      this.updateTheAccount(ret);
    })
    if(this.update) {
      this.oldTransaction = this.transactionForm.value;
    }
    this.addingMultiple.valueChanges.subscribe(val => {
      if(val) this.keepAccount.enable();
      else {
        this.keepAccount.patchValue(false);
        this.keepAccount.disable();
      }
    })
  }
  // function called to check the value of the accounts select is correct
  // If old saved pre March 2023, will automatically update account value to 
  updateTheAccount(accounts: any[]) {
    const currentAccount = accounts.find(item => item.name == this.transactionForm.value.account)
    if(currentAccount) {
      this.transactionForm.get('account')?.patchValue(currentAccount.id);
      this.updateTransaction(this.formPrefill.id, true);
    }
  }

  addTransaction() {
    this.submitting = true;
    const name = this.accountsArr.find(item => item.id == this.transactionForm.value.account)?.name;
    //if an account is selected
    if(name) {
      this.transactionsService.addTransaction(this.transactionForm.value, this.items, name).then(() => {
        if (!this.addingMultiple.value) this.transactionDialog.close();
        else {
          const dateHold: Date = this.transactionForm.value.transactionDate;
          const account: string = this.transactionForm.value.account;
          this.transactionForm.reset();
          this.transactionForm.get('transactionDate')?.patchValue(dateHold);
          if(this.keepAccount.value) this.transactionForm.get('account')?.patchValue(account);
        }
        this.submitting = false;
      });
    }
  }
  // dont close is for when the user opens a transaction that was added before march 2023, 
  //Function called automtically for accounts stored as account name and not id, to update the stored value to id
  updateTransaction(id:string, dontClose?: Boolean) {
   if(!(this.transactionForm.value == this.oldTransaction)) {
      this.transactionsService.updateTransaction(id, this.transactionForm.value, this.oldTransaction);
      if(!dontClose) this.transactionDialog.close();
    } else console.log('Nothing Changed bozo');
  }

  addItem(item: string, amount: number | null) {
    this.items.push(this.fb.group({item:item, amount: [amount, {updateOn: 'blur'}]}));
  }

  getItems() {
    return this.transactionForm.get('items') as FormArray;
  }

  deleteTransaction() {
    const transForm = this.transactionForm.value
    this.transactionsService.deleteTransaction(this.formPrefill.id, transForm.amount, transForm.account, transForm.category, transForm.transactionDate, transForm.frequency).then(() => {
      this.transactionDialog.close();
    })
  }

  getSimilarTransactions() {
    this.similarTransactions = this.transactionsService.getSimilarTransactions(this.transactionForm.value);
  }

  fillForm(data: {row: TransactionInterface}) {
    const row = data.row;
    this.transactionForm.get('account')?.setValue(row.account);
    this.transactionForm.get('category')?.setValue(row.category);
    this.transactionForm.get('frequency')?.setValue(row.frequency);
    this.transactionForm.get('location')?.setValue(row.location);
    row.items.forEach(data => {
      this.addItem(data.item, data.amount);
    })
  }
}
