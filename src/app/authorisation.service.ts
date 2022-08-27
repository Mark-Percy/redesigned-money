import { Injectable } from '@angular/core';
import { signInWithEmailAndPassword, sendEmailVerification, User } from "firebase/auth";
import { Auth, authState, createUserWithEmailAndPassword } from "@angular/fire/auth"
import { from, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, addDoc, collection, CollectionReference, docData } from '@angular/fire/firestore';
import { doc, setDoc } from 'firebase/firestore';

@Injectable({
	providedIn: 'root'
})

export class AuthorisationService {
	currentUser$ = authState(this.auth);
	user: User | null = null;
	userCollection: CollectionReference | undefined;
	userDocId: string | null = null;
	
	constructor(private auth: Auth, private firebaseAuth: AngularFireAuth, private fs: Firestore) {
		this.auth.onAuthStateChanged(user => {
			if(user) {
				this.user = user;
			}
		});
	}

	addUser(userDetails: User, email: string, password: string) {
		return createUserWithEmailAndPassword(this.auth, email, password).then(cred => {
			return setDoc(doc(collection(this.fs, 'users') ,cred.user.uid), userDetails)
		});
	}

	signOut(): Observable<void> {
		this.user = null;
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
	getDetails(){
		const docReference = doc(this.fs, `users/${this.user?.uid}`);
		console.log(docReference)
		return docData(docReference)
	}
	getUserId():string | null{
		if(!this.user) return null;
		return this.user.uid
	}
}