import { Component, Input, OnInit }				from '@angular/core';
import { NgStyle }								from '@angular/common';
import { MatAnchor, MatIconButton }				from '@angular/material/button';
import { MatDialog }							from '@angular/material/dialog';
import { MatIcon }								from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink }	from '@angular/router';

import { AddTransactionComponent }		from 'src/app/shared/components/add-transaction/add-transaction.component';
import { TransactionsTableComponent }	from 'src/app/shared/components/transactions-table/transactions-table.component';

@Component({
	selector: 'app-transaction',
	templateUrl: './transaction.component.html',
	styleUrls: ['./transaction.component.css', '../dashboard_base.css'],
	standalone: true,
	imports: [
		NgStyle,
		MatAnchor,
		RouterLink,
		MatIconButton,
		MatIcon,
		TransactionsTableComponent
	]
})
export class TransactionComponent implements OnInit {

	dashboardOpen: boolean | null = null;
	currDate: Date = new Date();
	month: number = this.currDate.getMonth();
	year: number = this.currDate.getFullYear();
	@Input() panelWidth = '45vw';

	constructor(private dialog: MatDialog, private router:Router, private route: ActivatedRoute) {}

	ngOnInit(): void {
		this.route.queryParams.subscribe(params => {
			this.dashboardOpen = params['addNewTransaction'];
			if(params['addNewTransaction'] == 1){
				this.dialog.open(AddTransactionComponent, {
					width: '500px'
				});
			}
		});
	}

	transactionDialog() {
		this.router.navigate([], {
			queryParams: {
				addNewTransaction: 1
			}
		});
	}
}