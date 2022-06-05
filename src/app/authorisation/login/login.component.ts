import { Component, OnInit } from '@angular/core';
import { AuthorisationService } from 'src/app/authorisation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthorisationService) { }

  ngOnInit(): void {
  }

  signIn(email:string, password:string){
    this.authService.signIn(email, password)
    console.log('hellos')
  }
}
