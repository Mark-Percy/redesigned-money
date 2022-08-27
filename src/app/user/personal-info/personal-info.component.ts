import { Component, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { AuthorisationService } from 'src/app/authorisation.service';

@Component({
  selector: 'app-personal-info',
  template: 'Hello {{ name }} <button mat-button color="primary" routerLink="/user/profile" *ngIf="!hasDisplayName()">Go to Profile</button>'
})
export class PersonalInfoComponent {
  name: string = 'Unknown';
  constructor(private authService: AuthorisationService) {
    if(this.authService.user?.displayName){
      this.name = this.authService.user.displayName;
    } else {
      this.name += ', Would you like to tell me who you are?' 
    }
  }

  hasDisplayName(){
    return this.authService.hasDisplayName();
  }

}
