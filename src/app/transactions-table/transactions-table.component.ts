import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TransactionsService } from '../shared/transactions.service';
import { Observable } from 'rxjs';
import { DocumentData } from 'firebase/firestore';

@Component({
  selector: 'app-transactions-table',
  templateUrl: './transactions-table.component.html',
  styleUrls: ['./transactions-table.component.css']
})
export class TransactionsTableComponent implements OnChanges{

  @Output('openDialog') close: EventEmitter<any> = new EventEmitter<any>();
  @Input('year') year: number = -1
  @Input('month') month: number = -1

  displayedColumns: string[] = ['transactionDate','amount', 'category', 'location'];
  currTransactions: Observable<DocumentData[]> = this.transactionService.getCurrTransactions(this.year, this.month);

  constructor(public transactionService: TransactionsService) {

  }
  ngOnChanges(changes: SimpleChanges): void {
    this.currTransactions = this.transactionService.getCurrTransactions(changes.year.currentValue, changes.month.currentValue)
  }

  openEditDialog(row: any) {
    row.date = row.transactionDate.toDate();
    this.close.emit({row:row})
  }

}