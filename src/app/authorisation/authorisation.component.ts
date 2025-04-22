import { Component } 									from '@angular/core';
import { MatTabNav, MatTabLink, MatTabNavPanel } 		from '@angular/material/tabs';
import { RouterLinkActive, RouterLink, RouterOutlet } 	from '@angular/router';

import { AuthorisationService } from '../shared/services/authorisation.service';
import { TransactionsService } 	from '../shared/services/transactions.service';


@Component({
	selector: 'app-authorisation',
	templateUrl: './authorisation.component.html',
	styleUrls: ['./authorisation.component.css'],
	standalone: true,
	imports: [
		MatTabLink,
		MatTabNav,
		MatTabNavPanel,
		RouterLink,
		RouterLinkActive,
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
