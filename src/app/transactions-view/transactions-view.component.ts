import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { TransAccountService } from '../trans-account.service';

@Component({
  selector: 'app-transactions-view',
  templateUrl: './transactions-view.component.html',
  styleUrls: ['./transactions-view.component.css']
})
export class TransactionsViewComponent implements OnInit {

  currDate = new Date();
  month;

  transactions = this.tras.getTransactionsForMonth(this.currDate);

  constructor(private tras: TransAccountService, private dialog: MatDialog) {
    this.month = this.currDate.toLocaleString('en-GB',{month:'long'});
  }

  ngOnInit(): void {
  }

  addTransaction() {
    this.dialog.open(AddTransactionComponent)
  }
}
