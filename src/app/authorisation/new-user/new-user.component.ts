import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AuthorisationService } from 'src/app/authorisation.service';
import { passwordMatch } from 'src/app/form-validation.dirtective';


@Component({
	selector: 'app-new-user',
	templateUrl: './new-user.component.html',
	styleUrls: ['./new-user.component.css']
})


export class NewUserComponent implements OnInit {

	@ViewChild('accountTabs') accountTabs!: MatTabGroup;

	selectedTab = new UntypedFormControl();

	hide: boolean = true;
	hideConfirm: boolean = true;

	newAccountForm!: UntypedFormGroup;
	errorMessage: String = '';

  	constructor(private authService: AuthorisationService, private fb: FormBuilder, private router:Router) {

	}

  	ngOnInit(): void {
		this.newAccountForm = this.fb.group({
			userDetails: this.fb.group({
				firstName: ['', Validators.required],
				surname: ['', Validators.required]
			}),
			accountDetails: this.fb.group({
				email: ['', [Validators.required, Validators.email]],
				password: ['', Validators.required],
				confirmPassword: ['', Validators.required],
				
			},{
				validators: [passwordMatch],
				updateOn: 'submit'
			})
	
		});
	}
  	updateUser() {
		if(!this.newAccountForm.valid) {
			const accountSection = this.newAccountForm.get('accountDetails');

		} else {
			this.authService.addUser(this.newAccountForm.get('accountDetails')?.get('email')?.value, this.newAccountForm.get('accountDetails')?.get('password')?.value).subscribe((response) => {
				let userDetails = {
					...this.newAccountForm.value.userDetails,
					email : this.newAccountForm.value.accountDetails.email,
					id: response.user.uid
				};
				this.authService.addUserDetails(userDetails);
				this.router.navigate(['dashboard']);
			});
			
		}
	}

  	moveTab(tabs: number): void {
		this.newAccountForm.get('userDetails')?.markAllAsTouched()
		if(this.newAccountForm.get('userDetails')?.valid) {
			this.selectedTab.setValue(this.selectedTab.value + tabs);
		}
	}
}