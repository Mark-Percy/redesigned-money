import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'money-manager';
  darkmode:boolean; 

  constructor(){
    this.darkmode = localStorage.getItem('dark') == "true" ? true : false;
  }

  changeThemeMode() {
    this.darkmode = !this.darkmode
    localStorage.setItem('dark', (this.darkmode ? "true" : "false"));
  }
}
