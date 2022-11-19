import { Component, Inject, INJECTOR, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TransAccountService } from '../trans-account.service';
import { Account } from '../user/account/account.interface';

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
  datePickerStart = new Date();
  constructor(private fb: FormBuilder,
              private transactionDialog: MatDialogRef<AddTransactionComponent>,
              private _adapter: DateAdapter<any>,
              private tras: TransAccountService,
              private router: Router,
              @Inject(MAT_DIALOG_DATA) public data: {date: Date}
            
  ){
    this.datePickerStart = this.data ? this.data.date : this.datePickerStart 
    this._adapter.setLocale('en-GB')

    this.accounts = this.tras.getAccounts();
    this.transactionForm = this.fb.group({
      transactionDate: this.datePickerStart,
      account: '',
      category: '',
      location: '',
      amount: '',
      items: this.fb.array([
        this.fb.group({
          item: '',
          amount: ['',{
            updateOn: 'blur',
          }],
        })
      ])
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
    this.transactionDialog.close();
    const transaction = {
      transactionDate: this.transactionForm.value.transactionDate,
      account: this.transactionForm.value.account,
      category: this.transactionForm.value.category,
      location: this.transactionForm.value.location,
      amount: this.transactionForm.value.amount
    }
    this.tras.addTransaction(transaction).then(transaction => {
      this.tras.addItems(this.items, transaction.id);

    });
  }
  addItem() {
    this.items.push(this.fb.group({item:'', amount: ['', {
      updateOn: 'blur'
    }]}));
  }

  getItems(){
    return this.transactionForm.get('items') as FormArray;
  }
}
