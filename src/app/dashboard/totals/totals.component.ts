import { Component, Input } from '@angular/core';
import { TransactionsInterface, TransactionsService } from 'src/app/shared/transactions.service';

@Component({
  selector: 'app-totals',
  templateUrl: './totals.component.html',
  styleUrls: ['./totals.component.css']
})
export class TotalsComponent {
  @Input('year') YearsData: TransactionsInterface;

  yearnum: number = new Date().getFullYear()
  yearIndex = 0
 
  constructor(private transactionService: TransactionsService) {
    
  }
  async setYear(num: number) {
    this.yearnum += num
    const ind = this.YearsData.years.findIndex(year => year.yearNum == this.yearnum)
    if(ind == -1) {
      const date = new Date()
      date.setFullYear(this.yearnum)
      await this.transactionService.setTransactionsForYear(date)
      this.yearIndex = this.YearsData.years.length
    } else this.yearIndex = ind
  }
}
