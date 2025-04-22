import { ApplicationConfig, DEFAULT_CURRENCY_CODE }	from "@angular/core";
import { initializeApp, provideFirebaseApp }		from "@angular/fire/app";
import { getAuth, provideAuth }						from "@angular/fire/auth";
import { FIREBASE_OPTIONS }							from "@angular/fire/compat";
import { getFirestore, provideFirestore }			from "@angular/fire/firestore";
import { provideNativeDateAdapter }					from "@angular/material/core";
import { provideAnimations }						from "@angular/platform-browser/animations";
import { provideRouter }							from "@angular/router";

import { accountCreationGuard }	from "./shared/guards/create-account.guard";
import { routes }				from "./app.routes";
import { environment }			from "src/environments/environment";

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