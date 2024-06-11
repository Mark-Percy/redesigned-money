import { enableProdMode, DEFAULT_CURRENCY_CODE, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { accountCreationGuard } from './app/authorisation.service';
import { provideNativeDateAdapter } from '@angular/material/core';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule, AngularFireModule.initializeApp(environment.firebase), AngularFireModule),
      { provide: DEFAULT_CURRENCY_CODE, useValue: 'GBP' },
      accountCreationGuard,
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
      provideAnimations(),
      provideNativeDateAdapter()
    ]
})
  .catch(err => console.error(err));
