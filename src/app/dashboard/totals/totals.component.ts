import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { CurrencyPipe, KeyValuePipe, NgStyle } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { TransactionMonthInterface } from 'src/app/shared/interfaces/transactionMonth.interface';
import { Subject, takeUntil } from 'rxjs';

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
export class TotalsComponent implements OnInit, OnDestroy {
	@Input() panelWidth = '45vw';

	public YearsData: Map<number, TransactionMonthInterface>;
	public yearNum: number = new Date().getFullYear();
	public isLoading: boolean = true;

	private destroy$ = new Subject<void>();


	constructor(private transactionService: TransactionsService) {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngOnInit(): void {
		this.transactionService.loadYearDataAction$.pipe(takeUntil(this.destroy$)).subscribe((date) => {
			this.transactionService.setTransactionsForYear(date).then((transactionsForYear) => {
				this.isLoading = false;
				if (transactionsForYear) this.YearsData = transactionsForYear;
		  	});
		});
	}
	
	async setYear(num: number) {
		this.isLoading = true;
		this.yearNum += num;
		const date = new Date();
		date.setFullYear(this.yearNum);
		this.transactionService.setTransactionsForYear(date)
			.then((transactionsForYear) => {
				this.isLoading = false;
				if (transactionsForYear) {
					this.YearsData = transactionsForYear;
				}
			});
	}
}
