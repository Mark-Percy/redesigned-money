import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Router } from '@angular/router';

import { AuthorisationService } from 'src/app/shared/services/authorisation.service';
import { passwordMatch } from '../validators/password-match.validator';


@Component({
    selector: 'app-new-user',
    templateUrl: './new-user.component.html',
    styleUrls: ['./new-user.component.css'],
    standalone: true,
    imports: [
		FormsModule,
		MatButton,
		MatFormField,
		MatLabel,
		MatIcon,
		MatIconButton,
		MatInput,
		MatSuffix,
		MatTabGroup,
		MatTab,
		ReactiveFormsModule,
	]
})


export class NewUserComponent implements OnInit {

	@ViewChild('accountTabs') accountTabs!: MatTabGroup;

	selectedTab: number = 0;

	hide: boolean = true;
	hideConfirm: boolean = true;

	newAccountForm: FormGroup;
	errorMessage: string = '';

  	constructor(private authService: AuthorisationService, private fb: FormBuilder, private router:Router) {}

  	ngOnInit(): void {
		this.newAccountForm = this.fb.group({
			userDetails: this.fb.group({
				firstName: ['', Validators.required],
				surname: ['', Validators.required],
			}),
			accountDetails: this.fb.group({
				email: ['', [Validators.required, Validators.email]],
				password: ['', Validators.required],
				confirmPassword: ['', Validators.required],
			},{
				validators: [passwordMatch],
				updateOn: 'submit',
			}),
		});
	}
	
  	async updateUser(): Promise<void> {
		if(this.newAccountForm.invalid) return

		await this.authService.addUser(this.newAccountForm.get('userDetails')?.value,
			this.newAccountForm.get('accountDetails')?.get('email')?.value,
			this.newAccountForm.get('accountDetails')?.get('password')?.value);

		this.router.navigate(['dashboard']);
	}

  	moveTab(tabs: number): void {
		this.newAccountForm.get('userDetails')?.markAllAsTouched()
		if(this.newAccountForm.get('userDetails')?.valid) {
			this.selectedTab += tabs;
		}
	}
}