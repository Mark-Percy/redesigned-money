import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FirebaseSetupService } from 'src/app/firebase.setup.service'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthorisationComponent } from './authorisation/authorisation.component';
import { LoginComponent } from './authorisation/login/login.component';

import { MaterialModule } from './module-libraries/material.module';

@NgModule({
  declarations: [
    AppComponent,
    AuthorisationComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule 
  ],
  providers: [FirebaseSetupService],
  bootstrap: [AppComponent]
})
export class AppModule { }
