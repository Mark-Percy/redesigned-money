import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Output() darkmodeEvent = new EventEmitter<boolean>(); 

  @Input() isDark: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  changeThemeMode() {
    this.darkmodeEvent.emit()
  }

}
