import { Component, Input, OnInit } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { TransAccountService } from 'src/app/trans-account.service';
import { Account } from 'src/app/user/account/account.interface';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {

  dashboardOpen: boolean | null = null;
  transactions: Observable<DocumentData[]> = this.tras.getTransactions(5);
  @Input() panelWidth = '45vw';
  dataSource = this.transactions
  displayedColumns: string[] = ['transactionDate','amount', 'category', 'location'];

  constructor(private dialog: MatDialog, private router:Router, private route: ActivatedRoute, private tras: TransAccountService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.dashboardOpen = params['addNewTransaction'];
      if(params['addNewTransaction'] == 1){
        this.dialog.open(AddTranactionDialog, {
          width: '500px'
        });
      }
    });
  }

  transactionDialog() {
    this.router.navigate([], {
      queryParams: {
        addNewTransaction: 1
      }
    });
  }
}


@Component({
  selector:'app-add-Transaction',
  template:`
          <h4>Add Transaction</h4>
          <form [formGroup]="transactionForm">
            <mat-form-field>
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="transactionDate">
              <mat-hint>DD/MM/YYYY</mat-hint>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Account</mat-label>
              <mat-select formControlName="account">
                <mat-option *ngFor="let account of accounts | async" value="{{ account.name }}">{{ account.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="Bills">Bills</mat-option>
                <mat-option value="Spending">Spending</mat-option>
                <mat-option value="Useless">Useless</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Location</mat-label>
              <input type="text" matInput formControlName="location">
            </mat-form-field>
            <section formArrayName="items">
            <div *ngFor="let item of items.controls; let i=index">
              <div [formGroupName]="i">
                <mat-form-field>
                  <mat-label>item</mat-label>
                  <input type="text" formControlName="item" matInput>
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Amount</mat-label>
                  <input type="number" formControlName="amount" matInput>
                </mat-form-field>
              </div>
            </div>
            </section>
            <button (click)="addItem()">Add Field</button>
            <button (click)="addTransaction()">Submit</button>
          </form>
            `
})

export class AddTranactionDialog {
  transactionForm: FormGroup;
  accounts: Observable<Account[]>
  numberOfItems: number = 1;
  items: FormArray;
  constructor(private fb: FormBuilder,
              private transactionDialog: MatDialogRef<AddTranactionDialog>,
              private _adapter: DateAdapter<any>,
              private tras: TransAccountService,
              private router: Router
            
  ){
    this._adapter.setLocale('en-GB')

    this.accounts = this.tras.getAccounts();
    this.transactionForm = this.fb.group({
      transactionDate: new Date(),
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
        }
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
