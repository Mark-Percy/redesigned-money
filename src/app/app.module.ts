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
import { AngularFireModule } from '@angular/fire/compat';

import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { UserComponent } from './user/user.component';
import { DasboardComponent } from './dasboard/dasboard.component';
import { AuthorisationService } from './authorisation.service';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { PersonalInfoComponent } from './user/personal-info/personal-info.component';
import { ProfileComponent } from './user/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthorisationComponent,
    LoginComponent,
    NewUserComponent,
    HomeComponent,
    HeaderComponent,
    UserComponent,
    DasboardComponent,
    PersonalInfoComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth())
  ],
  providers: [FirebaseConfig, AuthorisationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
