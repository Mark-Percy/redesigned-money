import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorisationService } from '../authorisation.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Output() darkmodeEvent = new EventEmitter<boolean>(); 

  @Input() isDark: boolean = false;
  constructor(public authService: AuthorisationService, private router: Router) { }

  ngOnInit(): void {
  }

  changeThemeMode() {
    this.darkmodeEvent.emit()
  }

  logout(){
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

}
