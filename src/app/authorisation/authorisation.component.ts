import { Component, OnInit } from '@angular/core';
import { AuthorisationService } from '../authorisation.service';
import { TransactionsService } from '../shared/services/transactions.service';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';


@Component({
    selector: 'app-authorisation',
    templateUrl: './authorisation.component.html',
    styleUrls: ['./authorisation.component.css'],
    standalone: true,
    imports: [
        MatTabNav,
        MatTabLink,
        RouterLinkActive,
        RouterLink,
        MatTabNavPanel,
        RouterOutlet,
    ],
})
export class AuthorisationComponent {
  links = [
    {label: "Login", link: "/account/login"}
  ];
  constructor(private authService: AuthorisationService, private transactionService: TransactionsService) {
    this.transactionService.clearMonths();
    this.authService.getAccountCreationEnabled().then((val) => {
      if(val){
        this.links.push({label: "New Account", link: "/account/new-user"});
      }
    })
  }
}
