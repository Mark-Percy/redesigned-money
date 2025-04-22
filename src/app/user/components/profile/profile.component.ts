import { Component, OnDestroy, OnInit }					from '@angular/core';
import { FormBuilder,FormsModule,ReactiveFormsModule }	from '@angular/forms';
import { MatIconButton }								from '@angular/material/button';
import { MatDialog }									from '@angular/material/dialog';
import { MatFormField,MatLabel,MatSuffix }				from '@angular/material/form-field';
import { MatGridList, MatGridTile }						from '@angular/material/grid-list';
import { MatIcon }										from '@angular/material/icon';
import { MatInput }										from '@angular/material/input';
import { Subject, takeUntil }		 					from 'rxjs';

import { AccountComponent }		from '../account/account.component';
import { AccountsService }		from 'src/app/shared/services/accounts.service';
import { AuthorisationService }	from 'src/app/shared/services/authorisation.service';
import { Account } 				from 'src/app/shared/interfaces/account.interface';
import { AddAccountDialog }		from '../add-account/add-account.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
	FormsModule,
	ReactiveFormsModule,
	MatGridList,
	MatGridTile,
	MatFormField,
	MatLabel,
	MatInput,
	MatIconButton,
	MatSuffix,
	MatIcon,
	AccountComponent,
  ],
})
export class ProfileComponent implements OnInit, OnDestroy {
  	public accounts: Account[] = [];

  	userDetailsForm = this.fb.group({
		email: [this.authService.user?.email],
		displayName: [
	  		{
				value: this.authService.user ? this.authService.user.displayName : null,
				disabled: this.hasDisplayName(),
	  		},
		],
		firstName: [''],
		surname: [''],
  	});

  	private ngUnsubscribe = new Subject<void>();

	constructor(
		private authService: AuthorisationService,
		private fb: FormBuilder,
		private dialog: MatDialog,
		private accountsService: AccountsService,
	) {
		this.authService.getDetails().subscribe((data) => {
			if (data) {
				this.userDetailsForm.get('firstName')?.patchValue(data['firstName']);
				this.userDetailsForm.get('surname')?.patchValue(data['surname']);
			}
		});
	}

  	ngOnInit(): void {
		this.accountsService.accounts$
	  		.pipe(takeUntil(this.ngUnsubscribe))
	  		.subscribe((accounts: Account[]) => (this.accounts = accounts));
  	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	verifyEmail() {
		this.authService.sendEmailVerification();
	}
	hasDisplayName() {
		return this.authService.hasDisplayName();
	}

	emailVerified() {
		return this.authService.user?.emailVerified;
	}

	openAddAccount(id?: string) {
		const addAccountDialog = this.dialog.open(AddAccountDialog, { data: id });
	}

	updateDisplayName() {
		this.authService.updateDisplayName(
		this.userDetailsForm.get('displayName')?.value,
		);
	}

	deleteAccount(id: string) {
		this.accountsService.deleteAccount(id);
	}
}
