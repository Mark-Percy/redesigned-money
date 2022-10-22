import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TransAccountService } from 'src/app/trans-account.service';
import { Account } from 'src/app/user/account/account.interface';

@Component({
  selector: 'app-savings',
  templateUrl: './savings.component.html',
  styleUrls: ['./savings.component.css']
})
export class SavingsComponent {

  columns = ['name', 'amount']
  accounts : Observable<Account[]> = this.tras.getAccounts('Savings');
  @Input() panelWidth = '45vw';

  constructor(private tras: TransAccountService) {
  }

}
