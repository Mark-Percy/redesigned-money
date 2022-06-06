import { Component, OnInit } from '@angular/core';
import { AuthorisationService } from '../authorisation.service';


@Component({
  selector: 'app-authorisation',
  templateUrl: './authorisation.component.html',
  styleUrls: ['./authorisation.component.css'],
  providers: [AuthorisationService]
})
export class AuthorisationComponent implements OnInit {
  links = [
    {label: "Login", link: "/account/login"},
    {label: "New Account", link: "/account/new-user"}

  ];
  constructor(private authService: AuthorisationService) { 
      
  }

  ngOnInit(): void {
  }

  
}
