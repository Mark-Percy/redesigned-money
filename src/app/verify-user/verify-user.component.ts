import { Component, OnInit } from '@angular/core';
import { AuthorisationService } from '../authorisation.service';

@Component({
  selector: 'app-verify-user',
  templateUrl: './verify-user.component.html',
  styleUrls: ['./verify-user.component.css']
})
export class VerifyUserComponent implements OnInit {

  constructor(private authService: AuthorisationService) { }

  ngOnInit(): void {
  }

  signOut() {
    this.authService.signOut();
  }
}
