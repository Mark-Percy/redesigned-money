import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthorisationService } from 'src/app/authorisation.service';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: true,
    imports: [
      FormsModule,
      ReactiveFormsModule,
      MatFormField,
      MatLabel,
      MatInput,
      MatButton]
})
export class LoginComponent implements OnInit {

  signInForm!: UntypedFormGroup
  constructor(private authService: AuthorisationService, private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email:['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
  }

  signIn(){
    if(!this.signInForm.valid) return
    this.authService.signIn(this.signInForm.get('email')?.value, this.signInForm.get('password')?.value).then(user => {
      if(user.user.uid) this.router.navigate(['dashboard'])
    });
  }
}
