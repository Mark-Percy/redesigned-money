import { Component, Output, EventEmitter, Input } from '@angular/core';
import { TransactionsService } from '../shared/transactions.service';
import { Observable } from 'rxjs';
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

  displayedColumns: string[] = ['transactionDate','amount', 'category', 'location'];

  constructor(public transactionService: TransactionsService) {}


  openEditDialog(row: any) {
    row.date = row.transactionDate.toDate();
    this.close.emit({row:row})
  }

}