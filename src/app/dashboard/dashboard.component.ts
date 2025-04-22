import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

import { PersonalInfoComponent } from '../user/components/personal-info/personal-info.component';
import { SavingsComponent } from './savings/savings.component';
import { TotalsComponent } from './totals/totals.component';
import { TransactionComponent } from './transaction/transaction.component';
import { TransactionsService } from 'src/app/shared/services/transactions.service';


@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css'],
	standalone: true,
	imports: [
		MatGridList,
		MatGridTile,
		MatIcon,
		MatIconButton,
		PersonalInfoComponent,
		TotalsComponent,
		TransactionComponent,
		SavingsComponent,
	]
})
export class DashboardComponent {
	dashboardCols: number = 2;
	currCol: number = 0;
	panelWidth: string = '45vw;';
	currYear: number = new Date().getFullYear();

	constructor(private responsive: BreakpointObserver, public transactionService: TransactionsService) {
		this.responsive.observe([
			Breakpoints.Web,
			Breakpoints.HandsetPortrait,
		]).subscribe((state: BreakpointState) => {
			if(state.breakpoints[Breakpoints.HandsetPortrait]){
				this.dashboardCols = 1;
				this.panelWidth = '95vw';
			}
			if(state.breakpoints[Breakpoints.Web]){
				this.dashboardCols = 2;
				this.panelWidth = '45vw';
			}
		})
	}

	switchCol(col: number) {
		this.currCol = col;
	}
}
