import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  dashboardCols: number = 2;
  rowsHeight:string = "vh";
  constructor(private responsive: BreakpointObserver) {
    this.responsive.observe([
      Breakpoints.Small,
      Breakpoints.Medium,

    ]).subscribe((state: BreakpointState) => {
      if(state.breakpoints[Breakpoints.Small]){
        this.dashboardCols = 1;
      }
      if(state.breakpoints[Breakpoints.Medium]){
        this.dashboardCols = 2;
      }
    })
  }

  ngOnInit(): void {
    
  }

}
