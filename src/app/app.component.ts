import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [
      HeaderComponent,
      RouterOutlet,
    ]
})
export class AppComponent {
  title = 'money-manager';
  darkmode:boolean; 

  constructor(private overlayContainer: OverlayContainer){
    this.darkmode = localStorage.getItem('dark') == "true" ? true : false;
    if(this.darkmode) this.overlayContainer.getContainerElement().classList.add('darkmode')
  }

  changeThemeMode() {
    this.darkmode = !this.darkmode
    if(this.darkmode) {
      this.overlayContainer.getContainerElement().classList.add('darkmode')
    } else {
      this.overlayContainer.getContainerElement().classList.remove('darkmode')
    }
    localStorage.setItem('dark', (this.darkmode ? "true" : "false"));
  }
}
