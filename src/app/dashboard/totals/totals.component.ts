import { Component, Input } from '@angular/core';
import {
  TransactionMonthInterface,
  TransactionsService,
} from 'src/app/shared/transactions.service';
import { CurrencyPipe, KeyValuePipe, NgStyle } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-totals',
  templateUrl: './totals.component.html',
  styleUrls: ['./totals.component.css', '../dashboard_base.css'],
  standalone: true,
  imports: [
    MatIconButton,
    MatIcon,
    CurrencyPipe,
    KeyValuePipe,
    NgStyle,
    LoadingSpinnerComponent,
  ],
})
export class TotalsComponent {
  @Input() panelWidth = '45vw';

  public YearsData: Map<number, TransactionMonthInterface>;
  public yearnum: number = new Date().getFullYear();
  public isLoading: boolean = true;

  constructor(private transactionService: TransactionsService) {
    this.transactionService
      .setTransactionsForYear(new Date())
      .then((transactionsForYear) => {
        this.isLoading = false;
        if (transactionsForYear) this.YearsData = transactionsForYear;
      });
  }
  async setYear(num: number) {
    this.isLoading = true;
    this.yearnum += num;
    const date = new Date();
    date.setFullYear(this.yearnum);
    this.transactionService
      .setTransactionsForYear(date)
      .then((transactionsForYear) => {
        this.isLoading = false;
        if (transactionsForYear) {
          this.YearsData = transactionsForYear;
        }
      });
  }
}
