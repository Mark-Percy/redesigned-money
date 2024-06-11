import { Component } from '@angular/core';
import { AuthorisationService } from 'src/app/authorisation.service';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-personal-info',
    template: 'Hello {{ name }} <button mat-button color="primary" routerLink="/user/profile" *ngIf="!hasDisplayName()">Go to Profile</button>',
    standalone: true,
    imports: [NgIf, MatButton, RouterLink]
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
