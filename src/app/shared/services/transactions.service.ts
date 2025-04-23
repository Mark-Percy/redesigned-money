import { Injectable, OnDestroy } from '@angular/core';
import { addDoc, AggregateField, collection, collectionData, CollectionReference, count, deleteDoc, doc, DocumentData, Firestore, getAggregateFromServer, limit, query, Query, orderBy, sum, updateDoc, where, writeBatch} from '@angular/fire/firestore';
import { FormArray } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Account } from '../interfaces/account.interface';
import { AccountsService } from './accounts.service';
import { AuthorisationService } from './authorisation.service';
import { Transaction } from '../interfaces/transaction.interface';
import { TransactionMonth } from '../interfaces/transactionMonth.interface';
import { SavingsService } from './savings.service';

@Injectable({
	providedIn: 'root'
})
export class TransactionsService implements OnDestroy{
	accounts: Account[];
	years: Map<number, Map<number, TransactionMonth>> = new Map();
	currDate = new Date();
	currYearInd: number = 0;
	currMonthInd: number = 0;
	private destroy$: Subject<void> = new Subject<void>();

	private transactionsPath: string;
	private itemsPath: string;
	private transactionCollection: CollectionReference;

	constructor(
		private fs: Firestore,
		private auth: AuthorisationService,
		private savingsService: SavingsService,
		private accountsService: AccountsService,
	) {
		this.transactionsPath = `users/${this.auth.getUserId()}/transactions`;
		this.itemsPath = `users/${this.auth.getUserId()}/items`;
		this.transactionCollection = collection(this.fs, this.transactionsPath);
		this.accountsService.accounts$.pipe(takeUntil(this.destroy$)).subscribe((accounts) => {
			this.accounts = accounts
		})
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	public async addTransaction(transactionForm: Transaction, items:any): Promise<any> {
		let resCode = 0;
		const savings = transactionForm.category == 'savings';
		if(!savings && transactionForm.amount){
			resCode = (await this.updateMonth(transactionForm.transactionDate, transactionForm.category, transactionForm.frequency, transactionForm.account, transactionForm.amount)).code;
		}
		if(resCode == 1 || savings) {
			return addDoc(this.transactionCollection, transactionForm).then(transaction => {
				if(!savings) {
					return this.addItems(items, transaction.id);
				} else {
					if(transactionForm.amount) this.savingsService.updatePot(transactionForm.pot, transactionForm.toAccount, transactionForm.amount);
					return 1;
				} 
			});
		}
	}
	
	private addItems(items: FormArray, transactionId: string) {
		const itemsCol = collection(this.fs, this.itemsPath);
		const batch = writeBatch(this.fs);
		const curritem = {
			transactionId: transactionId,
			item: null,
			amount: null,
		}
		items.controls.forEach(item => {
			curritem.item = item.value.item;
			curritem.amount = item.value.amount;
			batch.set(doc(itemsCol), curritem);
		})
		const res = {code: 0, message: 'Failed'};
		batch.commit().then(() => {
			res.code = 1;
			res.message = 'Success';
		}).catch((e) => {
			throw new Error(e.message);
		});
		return res;
	}

	public getTransactions(numberToLimit: number): Observable<Transaction[]> {
		const q = query(this.transactionCollection, orderBy('transactionDate', 'desc'), limit(numberToLimit));
		return collectionData(q, {idField: 'id'}) as Observable<Transaction[]>;
	}

	/*----------------------------------------------------------------------*/
	/* 			        Set month ready for caching data                    */
	/* 			 # Will return Month transaction data from cache	        */
	/* 			    		or from firestore if not set in cache           */
	/*----------------------------------------------------------------------*/

	public async setMonth(date: Date, includeTransactions: boolean): Promise<TransactionMonth> {
		// Setup Date
		const year: number = date.getFullYear();
		const month: number = date.getMonth();
		const monthName = new Date(0, month).toLocaleString('default', { month: 'long' });

		// Create start and end of the month being used
		const start = new Date(year, month, 1);
		const end = new Date(year, month + 1, 1);
		
		const allTrans = query(this.transactionCollection,
			where('transactionDate', '>=', start),
			where('transactionDate', '<', end),
		);

		// Retrieve current year map
		const heldYear = this.getHeldYear(year);

		// Get Month and check if transactions are already stored
		const heldMonth = this.getHeldMonth(heldYear,month);
		if(heldMonth) {
			if(includeTransactions && !heldMonth.transactions) heldMonth.transactions =  this.getTransactionsDataForMonth(allTrans);
			return heldMonth;
		}
		

		// Might be ported so that users can create their own categories
		// set up category amounts
		const categories = ['bills', 'spending', 'useless'];

		let categoryAmountsMap: Map<string, number> = await this.getFilteredTotals(start, end, 'category', categories);

		// Problem here is the accountIds array needs to be set after category amounts to allow time for accounts to be populated
		// Really we shouldn't be able to run setMonth until the accounts array is set
		let accountsId = this.accounts.map(account => account.id);
		let accountAmountsMap: Map<string, number> = await this.getFilteredTotals(start, end, 'account', accountsId);

		const aggOb1 = {
			sumOfAmounts: sum('amount'),
			countOfTransactions: count(),
		}
		const typesToRemove1 = ['savings']; 
		const typesToRemove2 = ['savings', 'bills', 'repayments']; 

		const aggOb2 = {
			sumOfAmounts: sum('amount'),
		}
		// Get aggregate values for totals with and without bills and repayments
		const totals = await this.getAggregateVals(aggOb1,typesToRemove1, start, end);
		const totalsExcBillsRepay = await this.getAggregateVals(aggOb2,typesToRemove2, start, end);
		const totalsData = totals.data();

		// We're here since the month wasn't set in cache so we need to setup the month data to return
		const monthData: TransactionMonth = {
			totalAmount: totalsData.sumOfAmounts,
			totalTransactions: totalsData.countOfTransactions ? totalsData.countOfTransactions : 0,
			totalsExcl: totalsExcBillsRepay.data().sumOfAmounts,
			categoryAmounts: categoryAmountsMap,
			accountAmounts: accountAmountsMap,
			monthName: monthName,
		}

		if(includeTransactions) monthData.transactions = this.getTransactionsDataForMonth(allTrans);
		heldYear.set(month, monthData);
		return monthData;
	}

	/*----------------------------------------------------------------------*/	
	/*				Set month helper proc									*/
	/*				Gets the year from cache							 	*/
	/*					If it doesn't exist sets it and returns the year 	*/
	/*----------------------------------------------------------------------*/
	private getHeldYear(year: number): Map<number, TransactionMonth> {
		if(!this.years.has(year)) this.years.set(year, new Map());
		return this.years.get(year)!;
	}

	/*----------------------------------------------------------------------*/	
	/*				Set month helper proc									*/
	/*				Gets the Month data from cache							*/
	/*					If it doesn't exist returns falsey data			 	*/
	/*----------------------------------------------------------------------*/
	private getHeldMonth(heldYear: Map<number, TransactionMonth>, month: number): TransactionMonth | null {
		if(heldYear.has(month)) return heldYear.get(month)!
		return null;
	}

	/*----------------------------------------------------------------------*/	
	/*				Set month helper proc									*/
	/*				gets Aggregate vals from firestore						*/
	/*						With Exclusion of certain categories		 	*/
	/*----------------------------------------------------------------------*/
	private async getAggregateVals(aggOb: {sumOfAmounts: AggregateField<number>, countOfTransactions?: AggregateField<number>}, typesToRemove: string[],start:Date,end:Date) {
		const totalsExcludeSavings = query(this.transactionCollection,
			where('transactionDate', '>=', start),
			where('transactionDate', '<=', end),
			where('category', 'not-in', typesToRemove),
		)
		const totals = getAggregateFromServer(totalsExcludeSavings, aggOb);
		return totals;
	}

	/*----------------------------------------------------------------------*/	
	/*				Set month helper proc									*/
	/*				gets Aggregate vals from firestore						*/
	/*						for each whereIterator passet				 	*/
	/*----------------------------------------------------------------------*/
	private async getFilteredTotals(start: Date, end: Date, type: string, whereIterartor: string[]): Promise<Map<string, number>> {
		let filteredAmountsMap: Map<string, number> = new Map();
		for(let item of whereIterartor) {
			const groupedTrans = query(this.transactionCollection,
				where('transactionDate', '>=', start),
				where('transactionDate', '<=', end),
				where(type, '==', item),
				where('category', 'not-in', ['savings']),
			);
			const snap = await getAggregateFromServer(groupedTrans, {
				amount: sum('amount'),
			})
			filteredAmountsMap.set(item, snap.data().amount);
		}
		return filteredAmountsMap;
	}

	/*----------------------------------------------------------------------*/	
	/*				Gets the latest transactions limited by number		 	*/
	/*----------------------------------------------------------------------*/
	getTransactionsDataForMonth(allTrans: Query<DocumentData, DocumentData>) {
		return collectionData(allTrans, {idField: 'id'}) as Observable<Transaction[]>;
	}

	async updateTransaction(id: string, transaction: any, oldTransaction: any) {
		let amountUpdated = false;
		const oldAccount = oldTransaction.account;
		const newAccount = transaction.account;
		if(oldAccount && newAccount) {
			await this.updateMonth(oldTransaction.transactionDate,
				oldTransaction.category,
				oldTransaction.frequency,
				oldAccount,
				Number(0 - oldTransaction.amount.toFixed(2)),
			);
			await this.updateMonth(transaction.transactionDate,
				transaction.category,
				transaction.frequency,
				newAccount,
				transaction.amount,
			);
			amountUpdated = true; 
		}
		const transCol = collection(this.fs, this.transactionsPath);
		const transactionRef = doc(transCol, id);
		await updateDoc(transactionRef, transaction);
		return {success: true, amountUpdate: amountUpdated};
	}

	async deleteTransaction(transactionId: string, amount: number, accountId: string, category: string, date: Date, frequency : string) {
		const transCol = collection(this.fs, this.transactionsPath);
		const itemsCol = collection(this.fs, this.itemsPath);
		const items = this.getItems(transactionId);

		items.forEach((data) => {
			if(data[0]) {
				deleteDoc(doc(itemsCol,data[0].id));
			}
		});
		// If the category is savings then the transaction doesn't have any impact on our totals since we still have the money.
		if(category == 'savings') {
			amount = 0;
		}
		// Update the local data for the month we have just removed a transaction from.
		await this.updateMonth(date, category, frequency, accountId, 0 - amount, true);
		await deleteDoc(doc(transCol, transactionId));
	}

	private getItems(transactionId: string) {
		const itemsCol = collection(this.fs, this.itemsPath);

		const q = query(itemsCol, where('transactionId', '==', transactionId));
		return collectionData(q, {idField: 'id'});
	}

	public async updateMonth(
		date:Date,
		category:string,
		frequency: string,
		account:string,
		amount: number,
		remove?: boolean
	):Promise<{code: number, message:string}> {
		const accountName = this.accounts.find(accountFind => accountFind.id == account)?.name;
		if(!accountName) throw new Error(`Account Not Id: ${account}; doesn't exist`);

		const num = remove ? -1 : 1;
		const year = date.getFullYear();
		const month = date.getMonth();
		let message = '';
		const yearHeld = this.years.get(year);
		let monthHeld;
		if(yearHeld) monthHeld = yearHeld.get(month);
		if(monthHeld) {
			monthHeld.totalAmount = Number((monthHeld.totalAmount + amount).toFixed(2));
			monthHeld.totalsExcl = Number((monthHeld.totalsExcl + amount).toFixed(2));
			monthHeld.totalTransactions++;
			this.setSubAmounts(category, accountName, amount, frequency, monthHeld);
		}
		return {code: 1, message: `Successful Month Amount: ${message}`};
	}

	private setSubAmounts(category: string, account:string, amount: number, frequency: string, transactionMonth: TransactionMonth) {
		//Categories
		const accountAmounts = transactionMonth.accountAmounts;
		const categoryAmounts = transactionMonth.categoryAmounts;
		const categoryAm = categoryAmounts.get(category);
		if(!categoryAm) categoryAmounts.set(category, amount);
		else categoryAmounts.set(category, Number((categoryAm + amount).toFixed(2)));

		//Accounts
		const currAccountAm = accountAmounts.get(account);
		if(!currAccountAm) accountAmounts.set(account, amount);
		else accountAmounts.set(account, Number((currAccountAm + amount).toFixed(2)));
	
	}

	public async setTransactionsForYear(date: Date): Promise<Map<number, TransactionMonth>> {
		for (let i = 0; i < 12; i++) {
			date.setMonth(i);
			this.setMonth(date, false);
		}
		const yearData = this.years.get(date.getFullYear());
		if(yearData) return yearData;
		throw new Error(`There was an error Adding the selected year to the year data: ${date.getFullYear()}`);
	}

	public clearMonths() {
		this.years.clear();
	}

	public getSimilarTransactions(transactionForm: Transaction) {
		const numberToLimit = 10;
		const account = transactionForm.account;
		const category = transactionForm.category;
		const location = transactionForm.location;
		const whereArr = [];

		if(account != '') whereArr.push(where('account', '==', account));
		if(category != '') whereArr.push(where('category', '==', category));
		if(location != '') whereArr.push(where('location', '==', location));

		const transCol = collection(this.fs, this.transactionsPath);
		const q = query(transCol, ...whereArr, orderBy('transactionDate', 'desc'), limit(numberToLimit));
		return collectionData(q, {idField: 'id'}) as Observable<Transaction[]>;
	}
}