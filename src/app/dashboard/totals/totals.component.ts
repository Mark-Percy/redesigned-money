import { CurrencyPipe, KeyValuePipe, NgStyle } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Subject } from 'rxjs';

import { LoadingSpinnerComponent } from 'src/app/shared/components/loading-spinner/loading-spinner.component';
import { TransactionMonth }	from 'src/app/shared/interfaces/transactionMonth.interface';
import { TransactionsService } from 'src/app/shared/services/transactions.service';

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

	public YearsData: Map<number, TransactionMonth>;
	public yearNum: number = new Date().getFullYear();
	public isLoading: boolean = true;

	private destroy$ = new Subject<void>();

	constructor(private transactionService: TransactionsService) {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngOnInit(): void {
		this.transactionService.setTransactionsForYear(new Date()).then((transactionsForYear) => {
			this.isLoading = false;
			if (transactionsForYear) this.YearsData = transactionsForYear;
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
