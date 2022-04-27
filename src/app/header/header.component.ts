import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Output() darkmodeEvent = new EventEmitter<boolean>(); 

  isDark: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  changeThemeMode() {
    this.darkmodeEvent.emit()
  }

}
