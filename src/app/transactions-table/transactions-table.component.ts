import { Component, Output, EventEmitter } from '@angular/core';
import { TransactionsService } from '../shared/transactions.service';

@Component({
  selector: 'app-transactions-table',
  templateUrl: './transactions-table.component.html',
  styleUrls: ['./transactions-table.component.css']
})
export class TransactionsTableComponent {

  @Output('openDialog') close: EventEmitter<any> = new EventEmitter<any>();

  displayedColumns: string[] = ['transactionDate','amount', 'category', 'location'];

  constructor(public transactionService: TransactionsService) { }

  openEditDialog(row: any) {
    row.date = row.transactionDate.toDate();
    this.close.emit({row:row})
  }

}