import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SavingsDialogComponent } from 'src/app/dashboard/savings/savings-dialog/savings-dialog.component';
import { Account } from 'src/app/user/account/account.interface';
import { MatTable,MatColumnDef,MatHeaderCellDef,MatHeaderCell,MatCellDef,MatCell,MatHeaderRowDef,MatHeaderRow,MatRowDef,MatRow } from '@angular/material/table';
import { NgStyle } from '@angular/common';
import { AccountsService } from 'src/app/shared/services/accounts.service';

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
  ],
})
export class SavingsComponent implements OnInit {
  public accounts: Account[];
  public columns = ['name', 'amount'];

  @Input() panelWidth = '45vw';

  constructor(
    public dialog: MatDialog,
    private accountsService: AccountsService,
  ) {}

  public ngOnInit(): void {
    this.accountsService.accounts$.subscribe((accounts: Account[]) => {
      this.accounts = accounts.filter(account => account.type == 'Savings');
    });
  }

  public viewSavings(id: string): void {
    this.dialog.open(SavingsDialogComponent, {
      data: id,
      width: '500px',
    });
  }
}
