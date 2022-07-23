import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { Auth, authState, createUserWithEmailAndPassword } from "@angular/fire/auth"
import { AngularFireAuthGuard } from '@angular/fire/compat/auth-guard';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators'
import { FirebaseConfig } from './firebase.config';

@Injectable({
	providedIn: 'root'
})

export class AuthorisationService {
	currentUser$ = authState(this.auth)
	user = this.auth.currentUser;
	constructor(private firebaseConfig: FirebaseConfig, private auth: Auth) {
	}

	addUser(email: string, password: string) {
		return from(createUserWithEmailAndPassword(this.auth, email, password));
	}

	signOut():void {
		this.auth.signOut();
	}

	signIn(email:string, password: string){
		return from(signInWithEmailAndPassword(this.auth, email, password));
	}


}


