import { ApplicationConfig, DEFAULT_CURRENCY_CODE } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { environment } from "src/environments/environment";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { provideAnimations } from "@angular/platform-browser/animations";
import { FIREBASE_OPTIONS } from "@angular/fire/compat";
import { accountCreationGuard } from "./authorisation.service";
import { provideNativeDateAdapter } from "@angular/material/core";


export const appConfig: ApplicationConfig = {
    providers: [
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore()),
        provideRouter(routes),
        provideAnimations(),
        accountCreationGuard,
        provideNativeDateAdapter(),
        {provide: FIREBASE_OPTIONS, useValue: environment.firebase},
        {provide: DEFAULT_CURRENCY_CODE, useValue: 'GBP'},
    ]
};