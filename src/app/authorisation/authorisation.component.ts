import { Component, OnInit } from '@angular/core';
import { AuthorisationService } from '../authorisation.service';


@Component({
  selector: 'app-authorisation',
  templateUrl: './authorisation.component.html',
  styleUrls: ['./authorisation.component.css'],
})
export class AuthorisationComponent implements OnInit {
  links = [
    {label: "Login", link: "/account/login"}
  ];
  constructor(private authService: AuthorisationService) { 
      authService.getAccountCreationEnabled().then((val) => {
        if(val){
          this.links.push({label: "New Account", link: "/account/new-user"})
        }
      })
  }

  ngOnInit(): void {
  }

  
}
