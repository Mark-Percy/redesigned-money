import { Component, Inject, INJECTOR, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Pot } from '../dashboard/savings/pots.interface';
import { AccountsService } from '../shared/accounts.service';
import { SavingsService } from '../shared/savings.service';
import { TransactionsService } from '../shared/transactions.service';
import { Account } from '../user/account/account.interface';

export interface TransactionInter {
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
  items: [];
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
  styleUrls: ['./add-transaction.component.css']
})
export class AddTransactionComponent implements OnInit {


  ngOnInit(): void {
  }
  transactionForm: FormGroup;
  accounts: Observable<Account[]>
  accountsArr:Account[] = [];
  pots: Observable<Pot[]>
  numberOfItems: number = 1;
  items: FormArray;
  formPrefill: TransactionInter = {
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

  
  constructor(private fb: FormBuilder,
              private transactionDialog: MatDialogRef<AddTransactionComponent>,
              private _adapter: DateAdapter<any>,
              private transactionsService: TransactionsService,
              private accountsService: AccountsService,
              private savingsService: SavingsService,
              private router: Router,
              @Inject(MAT_DIALOG_DATA) public data: {date?: Date, row:TransactionInter | null}  
  ){
    if(this.data && this.data.row) {
      this.formPrefill = this.data.row
      this.showFreq = this.formPrefill.category == 'bills'
      this.savings = this.formPrefill.category == 'savings'
      this.update = true;
    }
    this.formPrefill.date = this.data && this.data.date ? this.data.date : this.formPrefill.date 
    this._adapter.setLocale('en-GB')

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
        this.fb.group({
          item: '',
          amount: ['',{
            updateOn: 'blur',
          }],
        })
      ])
    })

    this.transactionForm.get('category')?.valueChanges.subscribe((val) => {
      this.showFreq = val == 'bills'
      this.savings = val == 'savings'
    })
    this.transactionForm.get('toAccount')?.valueChanges.subscribe((val) => {
      this.pots = this.savingsService.getPots(val)
    })

    this.items = this.getItems();

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
        sum += items[i].amount
      }
      this.transactionForm.get('amount')?.patchValue(sum)
    });

    this.accounts.subscribe((ret) => {
      this.accountsArr = ret
      this.updateTheAccount(ret)
    })
  }
  // function called to check the value of the accounts select is correct
  // If old saved pre March 2023, will automatically update account value to 
  updateTheAccount(accounts: any[]) {
    const currentAccount = accounts.find(item => item.name == this.transactionForm.value.account)
    if(currentAccount) {
      this.transactionForm.get('account')?.patchValue(currentAccount.id)
      this.updateTransaction(this.formPrefill.id, true)
    }
  }

  addTransaction() {
    const name = this.accountsArr.find(item => item.id == this.transactionForm.value.account)?.name
    //if an account is selected
    if(name) {
      this.transactionsService.addTransaction(this.transactionForm.value, this.items, name).then(() => {
        this.transactionDialog.close();
      });
    }
  }
  // dont close is for when the user opens a transaction that was added before march 2023, 
  //Function called automtically for accounts stored as account name and not id, to update the stored value to id
  updateTransaction(id:string, dontClose?: Boolean) {
    this.transactionsService.updateTransaction(id, this.transactionForm.value);
    if(!dontClose) this.transactionDialog.close()
  }

  addItem() {
    this.items.push(this.fb.group({item:'', amount: ['', {
      updateOn: 'blur'
    }]}));
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
}
