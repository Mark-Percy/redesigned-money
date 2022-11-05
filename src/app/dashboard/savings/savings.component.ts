import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { SavingsDialogComponent } from 'src/app/dashboard/savings/savings-dialog/savings-dialog.component';
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

  constructor(private tras: TransAccountService, public dialog: MatDialog) {

  }

  viewSavings(id:string) {
    const dialogRef = this.dialog.open(SavingsDialogComponent, {data: id, width: '500px'})

  }

}
