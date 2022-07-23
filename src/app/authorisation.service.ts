import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, sendEmailVerification, User } from "firebase/auth";
import { Auth, authState, createUserWithEmailAndPassword } from "@angular/fire/auth"
import { from } from 'rxjs';
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
				console.log("yes")
				this.user = user;
			}
		});
		console.log(this.user)
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

	sendEmailVerification() {
		if(this.user){
			sendEmailVerification(this.user);
		}
	}

}