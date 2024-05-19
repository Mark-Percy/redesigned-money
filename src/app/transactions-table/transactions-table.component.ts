import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TransactionsService } from '../shared/transactions.service';
import { Observable, filter, map} from 'rxjs';
import { TransactionInterface } from '../add-transaction/add-transaction.component';
import { TitleCasePipe, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';

@Component({
    selector: 'app-transactions-table',
    templateUrl: './transactions-table.component.html',
    styleUrls: ['./transactions-table.component.css'],
    standalone: true,
    imports: [
      MatTable,
      MatColumnDef,
      MatHeaderCellDef,
      MatHeaderCell,
      MatCellDef,
      MatCell,
      MatHeaderRowDef,
      MatHeaderRow,
      MatRowDef,
      MatRow,
      TitleCasePipe,
      CurrencyPipe,
      DatePipe,
    ]
})
export class TransactionsTableComponent{

  @Output('openDialog') close: EventEmitter<any> = new EventEmitter<any>();
  @Input('transactions') transactions: Observable<TransactionInterface[]> = this.transactionService.getTransactions(5)
  enableFilter = false;

  holdTransactions: Observable<TransactionInterface[]> | null = null

  displayedColumns: string[] = ['transactionDate','amount', 'category', 'location'];

  constructor(public transactionService: TransactionsService) {}

  filterData() {
    const filterString: string = 'test'
    // filterString.toLowerCase();
    this.holdTransactions = this.transactions
    this.transactions = (this.transactions.pipe(
      map(items => items.filter(item => item.location == filterString)),
      filter(items => items && items.length > 0)
    ))
  }

  removeFilter() {
    if(this.holdTransactions) this.transactions = this.holdTransactions
    this.holdTransactions = null
  }

  openEditDialog(row: any) {
    row.date = row.transactionDate.toDate();
    this.close.emit({row:row})
  }

}