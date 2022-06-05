import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged } from "firebase/auth";
import { FirebaseConfig } from './firebase.config';

@Injectable({
	providedIn: 'root'
})
export class AuthorisationService {

	auth = getAuth(this.firebaseConfig.app);
	user = this.auth.currentUser;
	loggedIn;
	
	constructor(private firebaseConfig: FirebaseConfig, private router:Router) {
		if(localStorage.getItem('loggedIn') == 'true') {
			this.loggedIn = true;
		} else {
			this.loggedIn = false;
		}
		onAuthStateChanged(this.auth, (user) =>{
			if(user) {
				this.loggedIn = true;
				localStorage.setItem('loggedIn','true')
			} else {
				this.loggedIn = false;
				localStorage.setItem('loggedIn', 'false')
			}
		});
	}

	addUser(email: string, password: string) {
		createUserWithEmailAndPassword(this.auth, email, password).then((userCredential) => {
			this.router.navigate(['verify-user']);
		});
	}

	isLoggedIn(): boolean{
		return this.loggedIn;
	}

	signOut():void {
		this.auth.signOut();
	}
}
