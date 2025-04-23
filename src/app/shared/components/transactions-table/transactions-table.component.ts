import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';

import { AccountsService } from '../../services/accounts.service';
import { Transaction } from '../../interfaces/transaction.interface';
import { TransactionsService } from '../../services/transactions.service';


@Component({
	selector: 'app-transactions-table',
	templateUrl: './transactions-table.component.html',
	styleUrls: ['./transactions-table.component.css'],
	standalone: true,
	imports: [
		CurrencyPipe,
		DatePipe,
		MatTable,
		MatCell,
		MatCellDef,
		MatColumnDef,
		MatHeaderCell,
		MatHeaderCellDef,
		MatHeaderRow,
		MatHeaderRowDef,
		MatRow,
		MatRowDef,
		TitleCasePipe,
	]
})
export class TransactionsTableComponent implements OnChanges {

	@Output('getRow') getRow: EventEmitter<any> = new EventEmitter<any>();
	@Input('transactions') transactions: Observable<Transaction[]> = this.transactionService.getTransactions(5);
	numOfTransactions: number = 1;
	displayedColumns: string[] = ['transactionDate','amount', 'category', 'location','account'];
	private accounts: Map<string, string> = new Map();
	private destroy$: Subject<void> = new Subject<void>;

	constructor(public transactionService: TransactionsService, public accountsService: AccountsService) {
		this.accountsService.accounts$.pipe(takeUntil(this.destroy$)).subscribe((accounts) => {
			accounts.forEach((account) => {
				this.accounts.set(account.id, account.name);
			} )
		})
	}

	ngOnChanges(changes: SimpleChanges): void {
		if(!this.transactions) {
			this.numOfTransactions = 0;
			return;
		}
		this.transactions.subscribe(data => {
			this.numOfTransactions = data.length;
		})
	}

	sendRow(row: any): void {
		row.date = row.transactionDate.toDate();
		this.getRow.emit({row:row});
	}

	getAccountName(accountId:string): string {
		const accountName = this.accounts.get(accountId);
		if(accountName) return accountName;
		throw new Error('AccountId Invalid');
	}
}