import { Component } from '@angular/core';
import { TransactionMonthInterface, TransactionsService } from 'src/app/shared/transactions.service';
import { CurrencyPipe, KeyValuePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
    selector: 'app-totals',
    templateUrl: './totals.component.html',
    styleUrls: ['./totals.component.css'],
    standalone: true,
    imports: [
      MatIconButton,
      MatIcon,
      CurrencyPipe,
      KeyValuePipe
    ]
})
export class TotalsComponent {
  YearsData: Map<number, TransactionMonthInterface>

  yearnum: number = new Date().getFullYear()
  yearIndex = 0
 
  constructor(private transactionService: TransactionsService) {
    this.transactionService.setTransactionsForYear(new Date()).then((transactionsForYear) => {
      if(transactionsForYear) this.YearsData = transactionsForYear
    })

  }
  async setYear(num: number) {
    this.yearnum += num
    const date = new Date()
    date.setFullYear(this.yearnum)
    this.transactionService.setTransactionsForYear(date).then((transactionsForYear) => {
      if(transactionsForYear) this.YearsData = transactionsForYear
    })
  }
}
