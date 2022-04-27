import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'money-manager';
  darkmode:boolean = false; 

  constructor(){}

  changeThemeMode() {
    this.darkmode = !this.darkmode
  }
}
