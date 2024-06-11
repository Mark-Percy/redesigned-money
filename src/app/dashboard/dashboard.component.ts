import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { TransactionsService } from '../shared/transactions.service';
import { TotalsComponent } from './totals/totals.component';
import { SavingsComponent } from './savings/savings.component';
import { TransactionComponent } from './transaction/transaction.component';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { PersonalInfoComponent } from '../user/personal-info/personal-info.component';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: true,
    imports: [
      PersonalInfoComponent,
      MatIconButton,
      MatIcon,
      MatGridList,
      MatGridTile,
      TransactionComponent,
      SavingsComponent,
      TotalsComponent,
    ]
})
export class DashboardComponent {

  dashboardCols: number = 2;
  currCol: number = 0
  panelWidth: string = '45vw;'
  currYear: number = new Date().getFullYear()
  constructor(private responsive: BreakpointObserver, public transactionService: TransactionsService) {
    this.responsive.observe([
      Breakpoints.Web,
      Breakpoints.HandsetPortrait

    ]).subscribe((state: BreakpointState) => {
      if(state.breakpoints[Breakpoints.HandsetPortrait]){
        this.dashboardCols = 1;
        this.panelWidth = '95vw'
      }
      if(state.breakpoints[Breakpoints.Web]){
        this.dashboardCols = 2;
        this.panelWidth = '45vw'
      }
    })
    const date = new Date()
  }

  switchCol(col: number) {
    this.currCol = col
  }
}
