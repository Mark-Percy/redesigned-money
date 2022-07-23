import { Component, OnInit } from '@angular/core';
import { AuthorisationService } from 'src/app/authorisation.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  email = this.authService.user?.email;

  constructor(private authService: AuthorisationService) {

  }

  ngOnInit(): void {
  }
  verifyEmail() {
    this.authService.sendEmailVerification();
  }

  ifEmailVerified() {
    return !this.authService.user?.emailVerified
  }

}
