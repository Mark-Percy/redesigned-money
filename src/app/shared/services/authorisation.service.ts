import { Injectable }																													from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile, User, UserCredential }	from "@angular/fire/auth"
import { collection, doc, docData, Firestore, getDoc, setDoc }																			from '@angular/fire/firestore';
import { from, Observable }																												from 'rxjs';

@Injectable({
	providedIn: 'root'
})

export class AuthorisationService {
	user: User | null = null;	
	constructor(private auth: Auth, private fs: Firestore) {
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

	signIn(email:string, password: string): Promise<UserCredential>{
		return signInWithEmailAndPassword(this.auth, email, password);
	}

	sendEmailVerification() {
		if(this.user){
			sendEmailVerification(this.user);
		}
	}
	getDetails(){
		const docReference = doc(this.fs, `users/${this.user?.uid}`);
		return docData(docReference)
	}
	getUserId():string | null{
		if(!this.user) return null;
		return this.user.uid
	}
	hasDisplayName(): boolean {
		return this.user ? this.user.displayName ? true : false : false
	}
	updateDisplayName(displayName: any) {
		const user = this.auth.currentUser?.displayName;
		if(this.user) updateProfile(this.user, {displayName: displayName});
	}
	getAccountCreationEnabled(): Promise<boolean>{
		const appSettingsRef = doc(this.fs, "settings", "appsettings")
		const appSettings = getDoc(appSettingsRef)
		return appSettings.then((docSnap) => {
			return docSnap.get('accountCreationEnabled')
		})
	}
}