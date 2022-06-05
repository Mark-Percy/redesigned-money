import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged } from "firebase/auth";
import { FirebaseConfig } from './firebase.config';

@Injectable({
	providedIn: 'root'
})
export class AuthorisationService {

	auth;
	loggedIn: boolean = false; 
	constructor(private firebaseConfig: FirebaseConfig, private router:Router) {
		this.auth = getAuth(this.firebaseConfig.app);
		onAuthStateChanged(this.auth, (user) =>{
			if(user) {
				// console.log('signed In')
				this.loggedIn = true;
			}
		});
	}
	

	addUser(email: string, password: string) {
		createUserWithEmailAndPassword(this.auth, email, password).then((userCredential) => {
			this.router.navigate(['verify-user']);

		});
	}

	isLoggedIn(): boolean{
		onAuthStateChanged(this.auth, (user) =>{
			if(user) {
				console.log('signed In')
				this.loggedIn = true;
			}
		});
		return this.loggedIn;
	}
	signOut():void {
		this.auth.signOut();
	}
}
