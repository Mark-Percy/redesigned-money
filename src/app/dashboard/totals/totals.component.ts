import { Component, Input } from '@angular/core';
import { TransactionsInterface, TransactionsService, TransactionsYearInterface } from 'src/app/shared/transactions.service';

@Component({
  selector: 'app-totals',
  templateUrl: './totals.component.html',
  styleUrls: ['./totals.component.css']
})
export class TotalsComponent {
  YearsData: TransactionsYearInterface = this.transactionService.transactionsForYear.years[0];

  yearnum: number = new Date().getFullYear()
  yearIndex = 0
 
  constructor(private transactionService: TransactionsService) {
    
  }
  async setYear(num: number) {
    this.yearnum += num
    const date = new Date()
    date.setFullYear(this.yearnum)
    this.transactionService.setTransactionsForYear(date).then((finished) => {
      if(!finished) return
      this.YearsData = finished.transactionsForYear
    })
  }
}
