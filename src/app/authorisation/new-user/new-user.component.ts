import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { AutorisationService } from '../authorisation.service';

@Component({
	selector: 'app-new-user',
	templateUrl: './new-user.component.html',
	styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {

	@ViewChild('accountTabs') accountTabs!: MatTabGroup;

	hide: boolean = true;
	hideConfirm: boolean = true;

	newAccountForm = this.fb.group({
		userDetails: this.fb.group({
			firstName: [''],
			surname: ['']
		}),
		accountDetails: this.fb.group({
			email: [''],
			password: [''],
			confirmPassword: ['']
		})
	})

  constructor(private authService: AutorisationService, private fb: FormBuilder) { }

  ngOnInit(): void {
  }
  updateUser() {
  }
}