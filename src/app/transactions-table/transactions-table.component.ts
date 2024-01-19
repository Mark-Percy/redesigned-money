import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TransactionsService } from '../shared/transactions.service';
import { Observable } from 'rxjs';
import { DocumentData } from 'firebase/firestore';
import { TransactionInterface } from '../add-transaction/add-transaction.component';

@Component({
  selector: 'app-transactions-table',
  templateUrl: './transactions-table.component.html',
  styleUrls: ['./transactions-table.component.css']
})
export class TransactionsTableComponent{

  @Output('openDialog') close: EventEmitter<any> = new EventEmitter<any>();
  @Input('transactions') transactions: Observable<TransactionInterface[]> = this.transactionService.getTransactions(5)

  displayedColumns: string[] = ['transactionDate','amount', 'category', 'location'];

  constructor(public transactionService: TransactionsService) {}


  openEditDialog(row: any) {
    row.date = row.transactionDate.toDate();
    this.close.emit({row:row})
  }

}