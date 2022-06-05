import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FirebaseConfig } from 'src/app/firebase.config'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthorisationComponent } from './authorisation/authorisation.component';
import { LoginComponent } from './authorisation/login/login.component';

import { MaterialModule } from './module-libraries/material.module';
import { NewUserComponent } from './authorisation/new-user/new-user.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VerifyUserComponent } from './verify-user/verify-user.component';


@NgModule({
  declarations: [
    AppComponent,
    AuthorisationComponent,
    LoginComponent,
    NewUserComponent,
    HomeComponent,
    HeaderComponent,
    VerifyUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [FirebaseConfig],
  bootstrap: [AppComponent]
})
export class AppModule { }
