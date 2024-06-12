import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { SavingsDialogComponent } from 'src/app/dashboard/savings/savings-dialog/savings-dialog.component';
import { AccountsService } from 'src/app/shared/accounts.service';
import { Account } from 'src/app/user/account/account.interface';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-savings',
    templateUrl: './savings.component.html',
    styleUrls: ['./savings.component.css', '../dashboard_base.css'],
    standalone: true,
    imports: [
      NgStyle,
      MatTable,
      MatColumnDef,
      MatHeaderCellDef,
      MatHeaderCell,
      MatCellDef,
      MatCell,
      MatHeaderRowDef,
      MatHeaderRow,
      MatRowDef,
      MatRow,
    ]
})
export class SavingsComponent {

  columns = ['name', 'amount']
  accounts : Observable<Account[]> = this.accountService.getAccounts('Savings');
  @Input() panelWidth = '45vw';

  constructor(private accountService: AccountsService, public dialog: MatDialog) {

  }

  viewSavings(id:string) {
    const dialogRef = this.dialog.open(SavingsDialogComponent, {data: id, width: '500px'})

  }

}
