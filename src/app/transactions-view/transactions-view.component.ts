import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatDatepickerInput, MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';

import { AddTransactionComponent } from '../shared/components/add-transaction/add-transaction.component';
import { TransactionsService } from '../shared/services/transactions.service';
import { Transaction } from '../shared/interfaces/transaction.interface';
import { TransactionsTableComponent } from '../shared/components/transactions-table/transactions-table.component';
import { AmountsBottomSheet } from './components/amounts-bottom-sheet.component';
import { TransactionMonth } from '../shared/interfaces/transactionMonth.interface';

@Component({
	selector: 'app-transactions-view',
	templateUrl: './transactions-view.component.html',
	styleUrls: ['./transactions-view.component.css'],
	standalone: true,
	imports: [
		AsyncPipe,
		CurrencyPipe,
		FormsModule,
		MatButton,
		MatDatepicker,
		MatDatepickerInput,
		MatFormField,
		MatIcon,
		MatIconButton,
		MatInput,
		ReactiveFormsModule,
		TransactionsTableComponent,
	]
})
export class TransactionsViewComponent implements OnInit, OnDestroy {
	today: Date = new Date();
	month: TransactionMonth;
	date: FormControl = new FormControl(new Date())
	isHandset: Observable<BreakpointState> = this.responsive.observe(Breakpoints.HandsetPortrait);
	isLoading = true;
	destroy$: Subject<void> = new Subject<void>();

	constructor(
		private transactionService: TransactionsService,
		private dialog: MatDialog, 
		private route: ActivatedRoute,
		private router: Router,
		private responsive: BreakpointObserver,
		private _bottomSheet: MatBottomSheet,
	) {
		this.month = {totalAmount: 0, totalTransactions:0, totalsExcl: 0, categoryAmounts: new Map(), accountAmounts:new Map() ,transactions: undefined, monthName: ''}
		// When the date in the page changes - refresh the data for the new date
		this.date.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value =>{
			this.router.navigate([], {
				queryParams: {month: value.getMonth(), year: value.getFullYear()}
			});
		});
		
	}
	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngOnInit(): void {
		this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
			this.date.value.setMonth(params['month']);
			this.date.value.setYear(params['year']);
			this.transactionService.setMonth(this.date.value, true).then(month => {
				this.month = month
			})
		});
	}

	changeDate(numOfMonths: number) {
		const holderDate: Date = this.date.value;
		holderDate.setMonth(this.date.value.getMonth() + numOfMonths);
		this.date.setValue(holderDate);
	}
	
	setMonthYear(value: Date, widget:any) {
		this.date.setValue(value);
		widget.close();
	}


	openBottom() {
		this._bottomSheet.open(AmountsBottomSheet, {data: this.date.value});
	}

	openTransactionsDialog(row: any) {
		this.dialog.open(AddTransactionComponent, {data: row});
	}

	checkCurrMonth(): boolean {
		return this.today.getMonth() == this.date.value.getMonth() && this.today.getFullYear() == this.date.value.getFullYear();
	}
	
	getMonthDays(): number {
		if(!this.checkCurrMonth()) {
			return new Date(this.date.value.getFullYear(), this.date.value.getMonth() + 1, 0).getDate();
		}
		return this.today.getDate();
	}
}