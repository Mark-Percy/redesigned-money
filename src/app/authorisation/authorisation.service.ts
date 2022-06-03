import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { FirebaseConfig } from '../firebase.config';

@Injectable({
	providedIn: 'root'
})
export class AuthorisationService {

	auth;
	constructor(private firebaseConfig: FirebaseConfig) {
		this.auth = getAuth(firebaseConfig.app)
	}


	addUser(email: string, password: string) {
		createUserWithEmailAndPassword(this.auth, email, password);
	}
}
