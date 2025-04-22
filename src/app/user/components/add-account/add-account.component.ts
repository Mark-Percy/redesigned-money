import { CdkScrollable }													from "@angular/cdk/scrolling";
import { Component, Inject }												from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder }			from "@angular/forms";
import { MatButton }														from "@angular/material/button";
import { MatOption }														from "@angular/material/core";
import { MatDialogContent, MatDialogTitle, MatDialogRef, MAT_DIALOG_DATA }	from "@angular/material/dialog";
import { MatFormField, MatLabel }											from "@angular/material/form-field";
import { MatInput }															from "@angular/material/input";
import { MatSelect }														from "@angular/material/select";

import { AccountsService }	from "src/app/shared/services/accounts.service";

@Component({
	selector: 'add-account',
	templateUrl:'./add-account.component.html',
	standalone: true,
	imports: [
		CdkScrollable,
		FormsModule,
		MatButton,
		MatDialogContent,
		MatDialogTitle,
		MatFormField,
		MatInput,
		MatLabel,
		MatOption,
		MatSelect,
		ReactiveFormsModule,
	],
})

export class AddAccountDialog {
	accountTypes: string[] = ['Credit', 'Debit', 'Savings'];
	accountForm: FormGroup;
	showNum: boolean = false;
	action = 'Add Account';

	constructor(
		public dialogRef: MatDialogRef<AddAccountDialog>,
		private fb: FormBuilder,
		private accountsService: AccountsService,
		@Inject(MAT_DIALOG_DATA) public id: string,
	) {
		this.accountForm = this.fb.group({
		name: '',
		type: '',
		amount: 0,
		});
		if (id) {
		this.action = 'Edit Account';
		let account = this.accountsService.getAccount(id);
		if (account) {
			this.fb.group(account);
			this.showNum = account.type == 'Credit';
		}
		}
		this.accountForm.get('type')?.valueChanges.subscribe((val) => {
		this.showNum = val == 'Savings' || val == 'Credit';
		});
	}

	submitAccount() {
		this.dialogRef.close();
		if (this.id == undefined)
		this.accountsService.addAccount(this.accountForm.value);
}
}