import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorisationService } from '../authorisation.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  @Output() darkmodeEvent = new EventEmitter<boolean>(); 

  @Input() isDark: boolean = false;
  constructor(public authService: AuthorisationService, private router: Router) { }

  changeThemeMode() {
    this.darkmodeEvent.emit()
  }
  isLoggedIn() {
    return this.authService.user ? true : false;
  }

  logout(): void{
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

}
