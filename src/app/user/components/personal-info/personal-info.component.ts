import { Component }  from '@angular/core';
import { MatButton }  from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { AuthorisationService } from 'src/app/shared/services/authorisation.service';

@Component({
    selector: 'app-personal-info',
    template: `<div>Hello {{ name }}<div>
                @if(!hasDisplayName()) {
                  <button mat-button color="primary" routerLink="/user/profile">Go to Profile</button>
                }
              `,
    standalone: true,
    imports: [MatButton, RouterLink]
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
