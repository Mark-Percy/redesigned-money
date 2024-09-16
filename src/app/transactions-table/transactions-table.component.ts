import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TransactionsService } from '../shared/transactions.service';
import { Observable } from 'rxjs';
import { TransactionInterface } from '../add-transaction/add-transaction.component';
import { TitleCasePipe, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { AccountsService } from '../shared/accounts.service';

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
export class TransactionsTableComponent implements OnChanges {

  @Output('getRow') getRow: EventEmitter<any> = new EventEmitter<any>();
  @Input('transactions') transactions: Observable<TransactionInterface[]> = this.transactionService.getTransactions(5)
  numOfTransactions: number = 1
  displayedColumns: string[] = ['transactionDate','amount', 'category', 'location','account'];

  constructor(public transactionService: TransactionsService, public accountService: AccountsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.transactions) {
      this.numOfTransactions = 0
      return
    }
    this.transactions.subscribe(data => {
      this.numOfTransactions = data.length
    })
  }


  sendRow(row: any) {
    row.date = row.transactionDate.toDate();
    this.getRow.emit({row:row})
  }

}