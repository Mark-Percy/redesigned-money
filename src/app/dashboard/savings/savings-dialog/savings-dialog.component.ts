import { CdkScrollable }																											from '@angular/cdk/scrolling';
import { Component, Inject }																										from '@angular/core';
import { CurrencyPipe }																												from '@angular/common';
import { FormBuilder,FormControl,FormsModule,ReactiveFormsModule}																	from '@angular/forms';
import { MatButton, MatMiniFabButton }																								from '@angular/material/button';
import { MAT_DIALOG_DATA,MatDialogTitle,MatDialogContent }																			from '@angular/material/dialog';
import { MatFormField }																												from '@angular/material/form-field';
import { MatIcon }																													from '@angular/material/icon';
import { MatInput }																													from '@angular/material/input';
import { MatTable,MatColumnDef,MatHeaderCellDef,MatHeaderCell,MatCellDef,MatCell,MatHeaderRowDef,MatHeaderRow,MatRowDef,MatRow }	from '@angular/material/table';
import { MatSnackBar }																												from '@angular/material/snack-bar';
import { Observable }																												from 'rxjs';
import { AccountsService } from 'src/app/shared/services/accounts.service';
import { SavingsService } from 'src/app/shared/services/savings.service';
import { Status } from 'src/app/shared/interfaces/status.interface';
import { Account } from 'src/app/shared/interfaces/account.interface';
import { Pot } from 'src/app/shared/interfaces/pots.interface';

@Component({
	selector: 'app-savings-dialog',
	templateUrl: './savings-dialog.component.html',
	styleUrls: ['./savings-dialog.component.css'],
	standalone: true,
	imports: [
		CdkScrollable,
		CurrencyPipe,
		FormsModule,
		MatButton,
		MatCell,
		MatCellDef,
		MatColumnDef,
		MatDialogContent,
		MatDialogTitle,
		MatFormField,
		MatHeaderCell,
		MatHeaderCellDef,
		MatHeaderRow,
		MatHeaderRowDef,
		MatInput,
		MatIcon,
		MatMiniFabButton,
		MatRow,
		MatRowDef,
		MatTable,
		ReactiveFormsModule,
	],
})
export class SavingsDialogComponent {
	accountId: string;
	account: Account;
	showAddPot: boolean = false;
	transfer = false;

	potsBetween: Pot[] = [];

	columns = ['name', 'amount'];
	pots: Observable<Pot[]>;
	name: FormControl = this.fb.control('');

	transferVal: FormControl<number | null> = this.fb.control(0);

	constructor(
		@Inject(MAT_DIALOG_DATA) public id: string,
		private accountsService: AccountsService,
		private savingsService: SavingsService,
		public fb: FormBuilder,
		private _snackBar: MatSnackBar,
	) {
		this.accountId = id;

		this.account = this.accountsService.getAccount(this.accountId);
		this.pots = this.savingsService.getPots(this.accountId);
	}

	addPot() {
		if (this.accountId) this.savingsService.addPot(this.accountId, this.name.value);
		this.showAddPot = false;
	}

	enableAddPot() {
		this.transfer = false;
		this.showAddPot = !this.showAddPot;
	}

	enableTransfer() {
		this.transfer = !this.transfer;
		let message = `Transfer ${this.transfer ? 'enabled' : 'disabled'}`;
		this.showAddPot = false;
		this.potsBetween = [];
		this._snackBar.open(message, undefined, {
			horizontalPosition: 'right',
			verticalPosition: 'top',
			duration: 5000,
		});
	}

	addToTransfer(pot: Pot) {
		if (!this.transfer) return;
		this.potsBetween.push(pot);
		if (this.potsBetween.length == 3) this.potsBetween.shift();
		while (this.potsBetween[0].amount == 0) this.potsBetween.shift();
	}

	transferValue() {
		let result: Status | null = null;
		if (this.transferVal.value && this.accountId) {
			result = this.savingsService.updatePotsAmounts(
				this.accountId,
				this.potsBetween,
				this.transferVal.value,
			);
		}
		this.potsBetween = [];
		this.transferVal.patchValue(0);
		let message: string = '';
		if (result) {
			message = result.msg;
		} else {
			message = 'Result Failed to be retrieved';
		}
		this._snackBar.open(message, undefined, {
			horizontalPosition: 'right',
			verticalPosition: 'top',
			duration: 5000,
		});
	}
}
