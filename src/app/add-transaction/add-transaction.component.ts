import { Component, Inject, INJECTOR, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountsService } from '../shared/accounts.service';
import { TransactionsService } from '../shared/transactions.service';
import { Account } from '../user/account/account.interface';

export interface FormPrefill {
  id: string;
  transactionDate: Date;
  date: Date;
  account: string;
  category: string;
  location: string;
  amount: number | null;
  frequency: string;
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
  numberOfItems: number = 1;
  items: FormArray;
  formPrefill: FormPrefill = {
    transactionDate: new Date(),
    id: '',
    date: new Date(),
    account: '',
    category: '',
    location: '',
    amount: null,
    frequency: '',
  }
  showFreq:boolean = false;
  update: boolean = false;
  
  constructor(private fb: FormBuilder,
              private transactionDialog: MatDialogRef<AddTransactionComponent>,
              private _adapter: DateAdapter<any>,
              private transactionsService: TransactionsService,
              private accountsService: AccountsService,
              private router: Router,
              @Inject(MAT_DIALOG_DATA) public data: {date?: Date, row:FormPrefill | null}  
  ){
    if(this.data && this.data.row) {
      this.formPrefill = this.data.row
      this.showFreq = this.formPrefill.category == 'bills'
      this.update = true;
    }
    this.formPrefill.date = this.data && this.data.date ? this.data.date : this.formPrefill.date 
    this._adapter.setLocale('en-GB')

    this.accounts = this.accountsService.getAccounts();
    this.transactionForm = this.fb.group({
      transactionDate: this.formPrefill.date,
      account: this.formPrefill.account,
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
  }

  addTransaction() {
    const transaction = {
      transactionDate: this.transactionForm.value.transactionDate,
      account: this.transactionForm.value.account,
      category: this.transactionForm.value.category,
      location: this.transactionForm.value.location,
      amount: this.transactionForm.value.amount,
      frequency: this.transactionForm.value.frequency
    }
    this.transactionsService.addTransaction(transaction, this.items).then(() => {
      this.transactionDialog.close();
    });
  }

  updateTransaction(id:string) {
    this.transactionsService.updateTransaction(id, 
      {
        transactionDate: this.transactionForm.value.transactionDate,
        account: this.transactionForm.value.account,
        category: this.transactionForm.value.category,
        location: this.transactionForm.value.location,
        amount: this.transactionForm.value.amount
      }
    );
    this.transactionDialog.close()
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
