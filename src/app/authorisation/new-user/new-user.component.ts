import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { passwordMatch } from 'src/app/form-validation.dirtective';
import { AutorisationService } from '../authorisation.service';


@Component({
	selector: 'app-new-user',
	templateUrl: './new-user.component.html',
	styleUrls: ['./new-user.component.css']
})


export class NewUserComponent implements OnInit {

	@ViewChild('accountTabs') accountTabs!: MatTabGroup;

	selectedTab = new FormControl();

	hide: boolean = true;
	hideConfirm: boolean = true;

	newAccountForm!: FormGroup;

  	constructor(private authService: AutorisationService, private fb: FormBuilder) { }

  	ngOnInit(): void {
		this.newAccountForm = this.fb.group({
			userDetails: this.fb.group({
				firstName: ['', Validators.required],
				surname: ['', Validators.required]
			}),
			accountDetails: this.fb.group({
				email: ['', Validators.required],
				password: ['', Validators.required],
				confirmPassword: ['', Validators.required],
				
			},{
				validators: [passwordMatch],
				updateOn: 'submit'
			})
	
		});
	}
  	updateUser() {
		if(this.newAccountForm.valid) {
			console.log('Form Submitted')

		} else {
			console.log('error')
		}
	}

  	moveTab(tabs: number): void {
		this.newAccountForm.get('userDetails')?.markAllAsTouched()
		if(this.newAccountForm.get('userDetails')?.valid) {
			this.selectedTab.setValue(this.selectedTab.value + tabs);
		}
	}
}