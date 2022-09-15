import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  dashboardCols: number = 2;
  panelWidth: string = '45vw;'
  constructor(private responsive: BreakpointObserver) {
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
  }

  ngOnInit(): void {
    
  }

}
