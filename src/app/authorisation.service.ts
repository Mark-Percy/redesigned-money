import { Injectable } from '@angular/core';
import { signInWithEmailAndPassword, sendEmailVerification, User } from "firebase/auth";
import { Auth, authState, createUserWithEmailAndPassword } from "@angular/fire/auth"
import { from, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
	providedIn: 'root'
})

export class AuthorisationService {
	currentUser$ = authState(this.auth);
	user: User | null = null;
	constructor(private auth: Auth, private firebaseAuth: AngularFireAuth) {
		this.auth.onAuthStateChanged(user => {
			if(user) {
				this.user = user;
			}
		});
	}

	addUser(email: string, password: string) {
		return from(createUserWithEmailAndPassword(this.auth, email, password));
	}

	signOut(): Observable<void> {
		return from(this.auth.signOut());
	}

	signIn(email:string, password: string){
		return from(signInWithEmailAndPassword(this.auth, email, password));
	}

	sendEmailVerification() {
		if(this.user){
			sendEmailVerification(this.user);
		}
	}

}