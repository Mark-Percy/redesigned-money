import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { TransactionMonthInterface, TransactionsService, TransactionsYearInterface } from '../shared/transactions.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  dashboardCols: number = 2;
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
    this.transactionService.setTransactionsForYear(date)
    this.transactionService.setMonthLimit(5);
    console.log(this.transactionService.transactionsForYear)
  }
}
