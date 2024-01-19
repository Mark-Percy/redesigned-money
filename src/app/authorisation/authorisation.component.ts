import { Component, OnInit } from '@angular/core';
import { AuthorisationService } from '../authorisation.service';
import { TransactionsService } from '../shared/transactions.service';


@Component({
  selector: 'app-authorisation',
  templateUrl: './authorisation.component.html',
  styleUrls: ['./authorisation.component.css'],
})
export class AuthorisationComponent {
  links = [
    {label: "Login", link: "/account/login"}
  ];
  constructor(private authService: AuthorisationService, private transactionService: TransactionsService) {
    this.transactionService.clearMonths();
    authService.getAccountCreationEnabled().then((val) => {
      if(val){
        this.links.push({label: "New Account", link: "/account/new-user"});
      }
    })
  }
}
