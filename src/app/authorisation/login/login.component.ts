import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthorisationService } from 'src/app/authorisation.service';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { AuthError, UserCredential } from 'firebase/auth';

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
    MatButton,
  ]
})

export class LoginComponent implements OnInit {

  public signInForm!: UntypedFormGroup;
  public errorMessage: string = '';

  constructor(
    private authService: AuthorisationService,
    private fb: FormBuilder,
    private router: Router
  ) {
    //
  }

  public ngOnInit(): void {
    this.signInForm = this.fb.group({
      email:['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  public signIn(): void {
    if(!this.signInForm.valid) return;

    this.authService.signIn(
      this.signInForm.get('email')?.value,
      this.signInForm.get('password')?.value,
    ).then((user: UserCredential) => {
        if(user.user.uid) {
          this.router.navigate(['dashboard']);
        }
    }).catch((error: AuthError) => this.errorMessage = 'Unable to login, please check credentials and try again!');
  }
}
