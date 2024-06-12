import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthorisationService } from '../authorisation.service';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: true,
    imports: [
      MatToolbar,
      RouterLink,
      MatButton,
      RouterLinkActive,
      MatMenuTrigger,
      MatIcon,
      MatMenu,
      MatMenuItem,
      MatSlideToggle,
    ]
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
