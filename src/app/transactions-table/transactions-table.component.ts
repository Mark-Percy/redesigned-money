import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TransactionsService } from '../shared/services/transactions.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { TitleCasePipe, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { TransactionInterface } from '../shared/interfaces/transaction.interface';
import { AccountsService } from '../shared/services/accounts.service';

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
  numOfTransactions: number = 1;
  displayedColumns: string[] = ['transactionDate','amount', 'category', 'location','account'];
  private accounts: Map<string, string> = new Map();
  private destroy$: Subject<void> = new Subject<void>;

  constructor(public transactionService: TransactionsService, public accountService: AccountsService) {
    this.accountService.accounts$.pipe(takeUntil(this.destroy$)).subscribe((accounts) => {
      accounts.forEach((account) => {
        this.accounts.set(account.id, account.name);
      } )
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.transactions) {
      this.numOfTransactions = 0;
      return
    }
    this.transactions.subscribe(data => {
      this.numOfTransactions = data.length;
    })
  }


  sendRow(row: any) {
    row.date = row.transactionDate.toDate();
    this.getRow.emit({row:row});
  }

  getAccountName(accountId:string): string {
    const accountName = this.accounts.get(accountId);
    if(accountName) return accountName;
    throw 'AccountId Invalid'
  }

}