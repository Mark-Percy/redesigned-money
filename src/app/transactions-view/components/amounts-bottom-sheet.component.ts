import { CurrencyPipe, KeyValuePipe, TitleCasePipe } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { AccountsService } from "src/app/shared/services/accounts.service";
import { TransactionsService } from "src/app/shared/services/transactions.service";

@Component({
	selector: 'bottom-sheet-overview-example-sheet',
	templateUrl: './amounts-bottom-sheet.component.html',
	styles: ['li {display:grid; grid-template-columns: 50% 35%}', '.bills {display:flex;justify-content:space-between}'],
	standalone: true,
	imports: [MatTabGroup, MatTab, TitleCasePipe, CurrencyPipe, KeyValuePipe]
})
export class AmountsBottomSheet {
	monthTransactions = this.transactionService.setMonth(this.passed, false);
	categoryAmounts: Map<string, number> = new Map();
	accountAmounts: Map<string, number> = new Map();
	constructor( 
		private transactionService: TransactionsService,
		private accountsService: AccountsService,
		@Inject(MAT_BOTTOM_SHEET_DATA) public passed: Date,
	) {
		this.monthTransactions.then(data => {
			this.categoryAmounts = data.categoryAmounts;
			this.accountAmounts = data.accountAmounts;
		})
	}

	getAccountName(accountId: string):string {
		return this.accountsService.getAccount(accountId).name;
	}
}