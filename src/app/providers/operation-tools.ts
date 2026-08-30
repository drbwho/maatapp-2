import { Injectable, ɵDEFAULT_LOCALE_ID } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from './config-data';
import { TranslateService } from '@ngx-translate/core';
import { formatDate } from '@angular/common';
import { Events } from './events';
import { DataProvider } from './provider-data';
import { Network } from '@capacitor/network';
import { AlertController, ToastController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserData } from './user-data';
import { MeetingTotals, Transaction } from '../interfaces/data-interfaces';

@Injectable({
    providedIn: 'root'
})
export class OperationTools {
    public credit_operations = ['ECP', 'RCB', 'REM', 'SFREM', 'FIN', 'ENF', 'PCO', 'AST', 'AID', 'SFND'];
    public debit_operations = ['RCP', 'EMP', 'SFEMP', 'AIN', 'CFS'];
    public contrib_operations = ['RCB', 'AID', 'AST'];
    public group_operations = ['PCO', 'AIN', 'CFS', 'SFND', 'ECPM', 'RCPM', 'REMM', 'EMPM'];
    public map_default_to_settings: Record<string, string> = {
        'RCB': 'regcontribution',
        'AID': 'regsfcontribution',
        'AST': 'regfacilpayment',
        'ENF': 'entryfee'
    }
    public tr_icons = {
        'ECP': 'wallet-plus', 'RCB': 'coins', 'REM': 'vase-plus', 'DPR': 'sprout', 'SFREM': 'vase-ok',
        'FIN': 'fine', 'ENF': 'entry', 'PCO': 'pouch-plus', 'AST': 'school', 'AID': 'ribbon', 'SFND': 'pouch-plus',
        'RCP': 'wallet-minus', 'EMP': 'feather', 'SFEMP': 'vase-plus', 'AIN': 'pouch-minus', 'CFS': 'hand-heart'
    };

    constructor(
        private http: HttpClient,
        private storage: Storage,
        private config: ConfigData,
        private translate: TranslateService,
        private events: Events,
        private dataProvider: DataProvider,
        private toast: ToastController,
        private loadingcontroller: LoadingController,
        private alertCtrl: AlertController,
        private user: UserData
    ) { }

    /*
    * Save locally a new Operation
    *
    */
    newOperation(idmeeting, account, group, idparameter, parametername, amount, categories = "", notes = ""): Promise<any> {
        var trn: Transaction = {
            idmeeting: idmeeting,
            idaccount: account.id,
            idparameter: idparameter,
            parametername: parametername,
            amount: amount,
            categories: categories,
            notes: notes,
            inputdate: formatDate(new Date(), 'Y-MM-dd H:mm:ss', ɵDEFAULT_LOCALE_ID)
        };

        return new Promise(async (resolve) => {
            //Check operation against account totals
            let check: any = await this.check_operation(account, group, trn);
            if (check.status != 'success') {
                resolve({ 'status': 'error', 'message': check.message });
                return;
            }
            await this.storage.get(this.config.TRANSACTIONS_FILE).then(async (res) => {
                var trns: Transaction[] = [];
                if (res) {
                    trns = res;
                }
                //Insert or update transaction
                let index = trns.findIndex((s) => s.idmeeting == idmeeting && s.idaccount == account.id && s.idparameter == idparameter);
                if (index >= 0) {
                    trns[index] = trn;
                } else {
                    trns.push(trn);
                }
                await this.storage.set(this.config.TRANSACTIONS_FILE, trns).then((res) => {
                    this.events.publish('upload:updated', idmeeting);
                    resolve({ 'status': 'success' });
                    return;
                })
            })
        });
    }

    delOperation(tr: any) {
        return new Promise(async (resolve) => {
            let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
            //find operation index
            let index = transactions.findIndex(s => s.idaccount == tr.idaccount && s.idmeeting == tr.idmeeting && s.idparameter == tr.idparameter && s.amount == tr.amount);
            transactions.splice(index, 1);//remove element from array
            this.storage.set(this.config.TRANSACTIONS_FILE, transactions).then(() => {
                this.events.publish('upload:updated', tr.idmeeting);
                resolve(true);
            });
        })
    }

    delOperationByParameter(accountId: any, meetingId: any, parameterId: any) {
        return new Promise(async (resolve) => {
            let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
            transactions = transactions.filter(s => !(s.idaccount == accountId && s.idmeeting == meetingId && s.idparameter == parameterId));
            await this.storage.set(this.config.TRANSACTIONS_FILE, transactions).then(() => {
                this.events.publish('upload:updated', meetingId);
                resolve(true);
            });
        })
    }

    /*
    * Remove account's pending operations
    *
    */
    delAccountOperations(account: any, meeting: any) {
        return new Promise(async (resolve) => {
            let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
            if (!transactions) {
                resolve(true);
                return;
            }
            transactions = transactions.filter(tr => !(tr.idaccount === account.id && tr.idmeeting === meeting.id));
            await this.storage.set(this.config.TRANSACTIONS_FILE, transactions).then(() => {
                this.events.publish('upload:updated', meeting.id);
                resolve(true);
            });
        })
    }

    async refreshMeetingHistory(meetingId: any) {
        let history: any = await this.getHistory(meetingId);
        history = history.operations;
        if (!history || !history.length) {
            return;
        }
        let old_history = await this.storage.get(this.config.HISTORY_TRANSACTIONS_FILE);
        if (old_history && old_history.length) {
            old_history = old_history.filter(s => s.idmeeting != meetingId);
            history = [...old_history, ...history];
        }
        this.storage.set(this.config.HISTORY_TRANSACTIONS_FILE, history);
    }

    clearPendingOperations(meeting: any, clearMeeting = false, upload_errors = null) {
        if (clearMeeting) {
            return new Promise(async (resolve) => {
                let newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
                if (newmeetings) {
                    newmeetings = newmeetings.filter(s => s.id != meeting.id);
                    this.storage.set(this.config.NEWMEETINS_FILE, newmeetings).then(() => {
                        this.events.publish('upload:updated', meeting.id);
                        resolve(true);
                    });
                } else {
                    resolve(false);
                }
            })
        }

        return new Promise(async (resolve) => {
            let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
            if (transactions) {
                if (!upload_errors) {
                    transactions = transactions.filter(s => s.idmeeting != meeting.id);
                } else {
                    transactions = transactions.filter(s => {
                        return (s.idmeeting != meeting.id ||
                            upload_errors.find(u => u.idmeeting == s.idmeeting
                                && u.idaccount == s.idaccount
                                && u.idparameter == s.idparameter))
                    });
                }
                //find index
                /*let index = transactions.findIndex(s => s.idmeeting == meeting.id);
                transactions.splice(index, 1);//remove element from array*/
                this.storage.set(this.config.TRANSACTIONS_FILE, transactions).then(() => {
                    this.events.publish('upload:updated', meeting.id);
                    resolve(true);
                });
            } else {
                resolve(true);
            }
        })
    }

    /*
    * Get History of transactions
    *
    */
    async getHistory(objectId: any, type = '') {
        let status = await Network.getStatus();
        if (!status.connected) {
            return new Promise(async (resolve) => {
                const toast = await this.toast.create({
                    message: 'Network error! Cannot get history data...',
                    cssClass: 'toast-alert',
                    duration: 3000
                });
                toast.present();
                resolve([]);
            })
        }

        let loading = await this.loadingcontroller.create({ showBackdrop: false });
        loading.present();

        let apiurl = this.config.GET_API_URL('operations', objectId);

        const user = await this.user.getUser();
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + user.token,
            'Accept': 'application/json'
        });

        return new Promise((resolve) => {
            this.http
                .get(apiurl, { headers })
                .subscribe({
                    next: (data: any) => {
                        loading.dismiss();
                        resolve(data);
                    },
                    error: async (error) => {
                        const toast = await this.toast.create({
                            message: 'Network error! Cannot get history data...',
                            cssClass: 'toast-alert',
                            duration: 3000
                        });
                        loading.dismiss().then(() => {
                            toast.present();
                        });
                        resolve([]);
                    }
                });
        });
    }


    /*
    * Init Syncing
    *
    */
    async uploadOperations(meeting) {
        // First sync new meeting
        if (meeting.pending) {
            let newmeet: any = await this.dataProvider.syncMeeting(meeting);
            if (newmeet.status != "success") {
                return new Promise((resolve) => {
                    resolve(newmeet);
                })
            } else {
                // clear meeting from local storage
                this.storage.get(this.config.NEWMEETINS_FILE).then((res) => {
                    let newmeetings = res;
                    // find index
                    let index = newmeetings.findIndex(s => s.id == meeting.id);
                    newmeetings.splice(index, 1);//remove element from array
                    this.storage.set(this.config.NEWMEETINS_FILE, newmeetings);
                    meeting.pending = false; //update meeting pending status
                })
            }
        }

        // Start sync transactions
        var transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
        if (transactions == null || !transactions.length) {
            return new Promise((resolve) => {
                resolve({ 'status': 'success' });
            })
        }
        transactions = transactions.filter(s => s.idmeeting == meeting.id);
        return new Promise(async (resolve) => {
            var res: any = { status: 'success', message: '' };
            //Clear previous uploading errors
            var upload_errors = await this.storage.get(this.config.UPLOAD_ERRORS_FILE);
            if (upload_errors) {
                upload_errors = upload_errors.filter((s) => s.idmeeting != meeting.id);
            } else {
                upload_errors = [];
            }
            var found_errors = false;
            res = await this.bulkSyncOperations(transactions, meeting.id);
            //if error stop uploading and return
            if (res.status.toLowerCase() == 'error') {
                // return name of account
                let accounts = await this.storage.get(this.config.GET_FILE('accounts'));
                // iterate through errors
                for (const err of res.errors) {
                    let account = accounts.find(s => s.id == err.idaccount);
                    let owner = account.owner;
                    upload_errors.push({ idmeeting: err.idmeeting, idaccount: err.idaccount, owner: owner, idparameter: err.idparameter, message: err.message });
                    found_errors = true;
                };
                //clear uploaded successfully pending operations
                this.clearPendingOperations(meeting, false, upload_errors)
            } else {
                //success
                //clear all uploaded pending operations
                this.clearPendingOperations(meeting);
            }

            this.storage.set(this.config.UPLOAD_ERRORS_FILE, upload_errors);
            if (found_errors) {
                this.translate.get('uploading_with_errors').subscribe((key) => {
                    resolve({ 'status': 'error', 'message': key });
                });
            }
            //Close meeting after succesfully uploading transactions
            if (meeting.endedat) {
                await this.dataProvider.closeMeeting(meeting);
            }
            resolve(res);
        })
    }


    /*
    * Sync a single operation to Server
    *
    */
    async syncOperation(tr) {
        const loading = await this.loadingcontroller.create({ showBackdrop: false });
        loading.present();

        let apiurl = this.config.GET_API_URL('operations', tr.idmeeting);

        const user = await this.user.getUser();
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + user.token,
            'Accept': 'application/json'
        });

        return new Promise((resolve) => {
            this.http
                .post(apiurl,
                    {
                        parameter: tr.idparameter,
                        accountid: tr.idaccount,
                        amount: tr.amount,
                        inputdate: tr.inputdate,
                        categories: tr.categories,
                        notes: tr.notes,
                        type: '',
                        usetimezone: 0
                    },
                    { headers })
                .subscribe({
                    next: (data: any) => {
                        loading.dismiss().then(() => {
                            resolve(data);
                        });
                    },
                    error: async (error) => {
                        loading.dismiss().then(() => {
                            resolve({ status: 'error', message: 'Network error' });
                        });
                    }
                });
        });
    }

    /*
    * Bulk Sync operations to Server
    *
    */
    async bulkSyncOperations(trs: Transaction[], idmeeting: string) {
        const loading = await this.loadingcontroller.create({ showBackdrop: false });
        loading.present();

        let apiurl = this.config.GET_API_URL('operations', idmeeting);

        const user = await this.user.getUser();
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + user.token,
            'Accept': 'application/json'
        });

        let load = [];
        trs.forEach(tr => {
            load.push({
                parameter: tr.idparameter,
                accountid: tr.idaccount,
                amount: tr.amount,
                inputdate: tr.inputdate,
                categories: tr.categories,
                notes: tr.notes,
                type: '',
                usetimezone: 0
            })
        })

        return new Promise((resolve) => {
            this.http
                .post(apiurl,
                    {
                        operations: load,
                        type: 'bulk'
                    },
                    { headers })
                .subscribe({
                    next: (data: any) => {
                        loading.dismiss().then(() => {
                            resolve(data);
                        });
                    },
                    error: async (error) => {
                        loading.dismiss().then(() => {
                            resolve({ status: 'error', message: 'Network error' });
                        });
                    }
                });
        });
    }


    /*
    * Estimate account/meeting totals from pending and uploaded transactions
    *
    */
    estimate_meeting_totals(account: any, meetingId: any): Promise<any> {
        return new Promise(async (resolve) => {
            let totals: MeetingTotals = {
                newcreditdisponible: 0.00,
                newbalance: 0.00,
                credit: 0.00,
                debit: 0.00,
                loans: 0.00,
                reimbursements: 0.00,
                transactions: new Map<string, number>()
            };
            let currenttr = 0.00;
            let trans = [];
            //await this.refreshMeetingHistory(meetingId); history is already refreshed! by total_ECP
            this.storage.get(this.config.TRANSACTIONS_FILE).then(async (data) => {
                if (data) {
                    trans = data.filter(s => s.idmeeting == meetingId);
                    if (account && account.type == 1) { // member account?
                        trans = trans.filter(s => s.idaccount == account.id);
                    }
                }
                let params = await this.storage.get(this.config.GET_FILE('params'));
                totals.newcreditdisponible = account?.creditdisponible ? parseFloat(account?.creditdisponible) : 0.00;
                totals.newbalance = account?.balance ? parseFloat(account?.balance) : 0.00;
                totals.credit = 0.00;
                totals.debit = 0.00;
                totals.loans = 0.00;
                totals.reimbursements = 0.00;
                trans.forEach((tr) => {
                    let pcode = (params.find((s) => s.id == tr.idparameter)).code;
                    if (this.credit_operations.includes(pcode)) {
                        //if(pcode != 'AST'){ // In server AST payments don't contribute to Group balance etc.!
                        totals.newcreditdisponible += parseFloat(tr.amount);
                        totals.newbalance += parseFloat(tr.amount);
                        //}
                        totals.credit += parseFloat(tr.amount);
                    } else if (this.debit_operations.includes(pcode)) {
                        totals.newcreditdisponible -= parseFloat(tr.amount);
                        if (pcode != 'CFS') {
                            totals.newbalance -= parseFloat(tr.amount);
                            totals.debit += parseFloat(tr.amount);
                        }
                    }
                    if (pcode == 'EMP') {
                        totals.loans += parseFloat(tr.amount);
                    }
                    if (pcode == 'REM') {
                        totals.reimbursements += parseFloat(tr.amount);
                    }
                    // save transactions' sums
                    currenttr = totals.transactions.get(pcode) || 0.00;
                    totals.transactions.set(pcode, currenttr + parseFloat(tr.amount));
                });

                // iterate through uploaded transactions
                let uploaded_transactions = await this.storage.get(this.config.HISTORY_TRANSACTIONS_FILE);
                if (uploaded_transactions && uploaded_transactions.length) {
                    uploaded_transactions = uploaded_transactions.filter(s => s.idmeeting == meetingId);
                    if (account && account.type == 1) { // member account?
                        uploaded_transactions = uploaded_transactions.filter(s => s.idaccount == account.id || s.idorigin == account.id);
                    }
                    if (uploaded_transactions.length) {
                        uploaded_transactions.forEach((tr) => {
                            let pcode = (params.find((s) => s.id == tr.idparameter)).code;
                            // calculate cash only from uploaded transactions
                            if (this.credit_operations.includes(pcode)) {
                                totals.credit += parseFloat(tr.credit ? tr.credit : tr.debit);
                            } else if (this.debit_operations.includes(pcode)) {
                                totals.debit += parseFloat(tr.credit ? tr.credit : tr.debit);
                            }
                            if (pcode == 'EMP') {
                                totals.loans += parseFloat(tr.credit ? tr.credit : tr.debit);
                            }
                            if (pcode == 'REM') {
                                totals.reimbursements += parseFloat(tr.credit ? tr.credit : tr.debit);
                            }
                            // save transactions' sums
                            currenttr = totals.transactions.get(pcode) || 0.00;
                            totals.transactions.set(pcode, currenttr + parseFloat((tr.credit ? tr.credit : tr.debit)));
                        });
                    }
                }
                resolve(totals);
            })
        });
    }

    /*
    * Check operation amount against totals
    *
    */
    check_operation(account, group, transaction) {
        return new Promise(async (resolve) => {
            if (transaction.amount < 0) {
                this.translate.get('amounts_cannot_be_negative').subscribe((key) => {
                    resolve({ 'status': 'error', 'message': key })
                })
            }
            let params = await this.storage.get(this.config.GET_FILE('params'));
            let pcode = (params.find((s) => s.id == transaction.idparameter)).code;
            let group_account = await this.storage.get(this.config.GET_FILE('accounts'));
            if (account.type == 2) {
                group_account = account;
            } else {
                group_account = group_account.find((s) => s.idowner == group.id);
            }
            let group_totals = await this.estimate_meeting_totals(group_account, transaction.idmeeting);
            switch (pcode) {
                case 'EMP':
                    if (transaction.amount > account.creditdisponible && group.settings.credit_borrow_multiplier >= 0) {
                        this.translate.get('loan_exceeds_credit_available').subscribe((key) => {
                            resolve({ 'status': 'error', 'message': key })
                        });
                    }
                    if (transaction.amount > group_account.creditdisponible) { //group_totals.newcreditdisponible){ ?? new credit or no?
                        this.translate.get('loan_exceeds_group_credit_available').subscribe((key) => {
                            resolve({ 'status': 'error', 'message': key })
                        });
                    }
                    if (group.settings.maxnumopenloans > 0 && (account.openloans >= group.settings.maxnumopenloans)) {
                        this.translate.get('max_num_loans_exceeded').subscribe((key) => {
                            resolve({ 'status': 'error', 'message': key })
                        });
                    }
                    if (group.settings.maxnumopensfloans > 0 && (account.sfopenloans >= group.settings.maxnumopensfloans)) {
                        this.translate.get('max_num_sfloans_exceeded').subscribe((key) => {
                            resolve({ 'status': 'error', 'message': key })
                        });
                    }
                    break;
                case 'RCP':
                    if (account.restearembourser > 0) {
                        this.translate.get('withdrawl_not_permitted_open_loans').subscribe((key) => {
                            resolve({ 'status': 'error', 'message': key })
                        });
                        break;
                    }
                    if (transaction.amount > account.balance) {
                        this.translate.get('withdrawl_exceeds_balance').subscribe((key) => {
                            resolve({ 'status': 'error', 'message': key })
                        });
                    }
                    break;
                case 'SFEMP':
                    if (transaction.amount > group_account.creditdisponible ||
                        transaction.amount > (group_account.sfcontribution - group_account.sfrestearembourser)) {
                        this.translate.get('loan_exceeds_group_totals').subscribe((key) => {
                            resolve({ 'status': 'error', 'message': key })
                        });
                    }
                    if (transaction.amount > group_totals.credit) {
                        this.translate.get('loan_exceeds_group_credit_available').subscribe((key) => {
                            resolve({ 'status': 'error', 'message': key })
                        });
                    }
                    break;
                case 'REM':
                    if (transaction.amount > account.restearembourser) {
                        this.translate.get('reimbursement_exceeds_loan_debt').subscribe((key) => {
                            resolve({ 'status': 'error', 'message': key })
                        });
                    }
                    break;
                case 'SFREM':
                    if (transaction.amount > account.sfrestearembourser) {
                        this.translate.get('reimbursement_exceeds_sf_loan_debt').subscribe((key) => {
                            resolve({ 'status': 'error', 'message': key })
                        });
                    }
                    break;
            }

            //Group transactions
            let groupops = ['AIN', 'CFS', 'RCPM', 'REMM', 'EMPM'];
            if (groupops.includes(pcode)) {
                if (transaction.amount > group_totals.credit) {
                    this.translate.get('amount_exceeds_group_credit_available').subscribe((key) => {
                        resolve({ 'status': 'error', 'message': key })
                    });
                }
            }

            resolve({ 'status': 'success' });
        })
    }

    /*
    * Get number of ECP transactions
    *
    */
    get_num_of_ECP(meeting, countryId): Promise<number> {
        return new Promise((resolve) => {
            this.storage.get(this.config.GET_FILE('params')).then(async (data: any) => {
                let param = null;
                if (data && data.length) {
                    param = (data.filter((a) => a.code === 'ECP'))[0];
                }
                this.refreshMeetingHistory(meeting.id).then(() => {
                    let trans = [];
                    this.storage.get(this.config.TRANSACTIONS_FILE).then(async (data) => {
                        if (data && data.length) {
                            trans = data.filter(s => s.idmeeting == meeting.id && s.idparameter == param.id && !s.is_cancelled);
                        }
                        // iterate through uploaded transactions
                        this.storage.get(this.config.HISTORY_TRANSACTIONS_FILE).then((data) => {
                            if (data && data.length) {
                                let uptrans = data.filter(s => s.idmeeting == meeting.id && s.idparameter == param.id && s.is_cancelled == false);
                                trans = [...trans, ...uptrans];
                            }
                            let num = new Set(trans?.map(d => d.idaccount)).size;
                            resolve(num);
                        });
                    })
                })
            })
        })
    }

    async has_pending_transactions(idmeeting: string) {
        let numpending = 0;
        await this.storage.get(this.config.TRANSACTIONS_FILE).then((trns) => {
            if (trns && (trns.filter(s => s.idmeeting == idmeeting)).length) {
                numpending = (trns.filter(s => s.idmeeting == idmeeting)).length;
            }
            return numpending;
        });
    }

    show_alert(message: string) {
        this.translate.get(['error', 'confirm']).subscribe(async (keys: any) => {
            const alert = await this.alertCtrl.create({
                header: keys['error'],
                message: message,
                buttons: [
                    {
                        text: keys['confirm'],
                    }
                ],
            });
            await alert.present();
        });
    }

}
