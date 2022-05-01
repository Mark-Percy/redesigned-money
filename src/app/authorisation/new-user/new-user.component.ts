import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AutorisationService } from '../authorisation.service';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {

  email = new FormControl('');
  password = new FormControl('');
  passwordConfirm = new FormControl('');
  hide: boolean = true;
  hideConfirm: boolean = true;

  user = {
    email: '',
    password: '',
  }

  constructor(private authService: AutorisationService) { }

  ngOnInit(): void {
  }
  updateUser() {
    if (this.email.value != '' && this.password.value) {
      this.authService.AddUser(this.email.value, this.password.value)

    }
  }
}
