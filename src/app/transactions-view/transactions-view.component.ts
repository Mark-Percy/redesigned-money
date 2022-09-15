import { Component, OnInit } from '@angular/core';
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

  constructor(private tras: TransAccountService) {
    this.month = this.currDate.toLocaleString('en-GB',{month:'long'});
  }

  ngOnInit(): void {
  }

}
