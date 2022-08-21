import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthorisationService } from 'src/app/authorisation.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userDetailsForm = this.fb.group({
    email: [this.authService.user?.email],
    firstName : [''],
    surname : [''],
  })

  constructor(private authService: AuthorisationService, private fb: FormBuilder) {
    this.authService.getDetails().subscribe(data => {
      this.userDetailsForm.get('firstName')?.patchValue(data['firstName']);
      this.userDetailsForm.get('surname')?.patchValue(data['surname']);
    });
  }

  ngOnInit(): void {
  }

  verifyEmail() {
    this.authService.sendEmailVerification();
  }

  emailVerified() {
    return this.authService.user?.emailVerified
  }
}