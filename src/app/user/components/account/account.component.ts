import { Component, Input, EventEmitter, Output }	from '@angular/core';
import { MatIconButton }							from '@angular/material/button';
import { MatIcon }									from '@angular/material/icon';
import { MatGridList, MatGridTile }					from '@angular/material/grid-list';

import { Account } from 'src/app/shared/interfaces/account.interface';

@Component({
	selector: 'app-account',
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.css'],
	standalone: true,
	imports: [
		MatGridList,
		MatGridTile,
		MatIconButton,
		MatIcon,
	]
})
export class AccountComponent {

	@Input() account: Account | null = null;
	@Output() deleteTheAccount = new EventEmitter<string>();
	@Output() editTheAccount = new EventEmitter<string>();

	constructor() { }

	deleteAccount() {
		this.deleteTheAccount.emit(this.account?.id)
	}
	editAccount() {
		this.editTheAccount.emit(this.account?.id)
	}
}