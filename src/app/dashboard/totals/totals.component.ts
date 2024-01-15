import { Component, Input } from '@angular/core';
import { TransactionMonthInterface, TransactionsYearInterface } from 'src/app/shared/transactions.service';

@Component({
  selector: 'app-totals',
  templateUrl: './totals.component.html',
  styleUrls: ['./totals.component.css']
})
export class TotalsComponent {
  @Input('year') year: TransactionsYearInterface;
 
  constructor() {
    
  }
}
