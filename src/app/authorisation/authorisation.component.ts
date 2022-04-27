import { Component, OnInit } from '@angular/core';
import { AutorisationService } from './authorisation.service';


@Component({
  selector: 'app-authorisation',
  templateUrl: './authorisation.component.html',
  styleUrls: ['./authorisation.component.css'],
  providers: [AutorisationService]
})
export class AuthorisationComponent implements OnInit {

  constructor(private authorisationService: AutorisationService) { 
      
  }

  ngOnInit(): void {
  }

  
}
