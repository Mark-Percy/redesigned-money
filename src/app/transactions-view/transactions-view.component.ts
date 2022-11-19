import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { TransAccountService } from '../trans-account.service';

@Component({
  selector: 'app-transactions-view',
  templateUrl: './transactions-view.component.html',
  styleUrls: ['./transactions-view.component.css']
})
export class TransactionsViewComponent{

  currDate = new Date();
  month;
  year;

  transactions = this.tras.getTransactionsForMonth(this.currDate);

  constructor(private tras: TransAccountService, private dialog: MatDialog, private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.currDate.setMonth(params['month'])
    });
    this.month = this.currDate.toLocaleString('en-GB',{month:'long'});
    this.year = this.currDate.getFullYear();
    this.currDate.setDate(1)
  }

  addTransaction() {
    this.dialog.open(AddTransactionComponent, {data: {date:this.currDate}})
  }

  changeDate(numOfMonths: number) {
    this.currDate.setMonth(this.currDate.getMonth() + numOfMonths);
    this.month = this.currDate.toLocaleString('en-GB',{month:'long'});
    this.transactions = this.tras.getTransactionsForMonth(this.currDate);
    this.year = this.currDate.getFullYear();
    this.router.navigate([], {
      queryParams: {month: this.currDate.getMonth()}
    })
  }
}
