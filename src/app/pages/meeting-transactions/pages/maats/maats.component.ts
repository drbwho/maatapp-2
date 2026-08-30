import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { TransactionsComponent } from '../transactions/transactions.component';
import { ModalController, IonGrid, IonRow, IonCol, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonAvatar, IonIcon, IonNote, IonCard, IonItemOption, IonItemOptions, IonItemSliding, IonInput, IonBadge } from '@ionic/angular';
import { OperationTools } from '../../../../providers/operation-tools';
import { LoanInfoComponent } from '../../../../component/loan-info/loan-info.component';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../../../providers/config-data';
import { AccountInfoComponent } from '../../../../component/account-info/account-info.component';
import { addIcons } from "ionicons";
import { checkmarkSharp, checkmarkCircleSharp, close, informationCircle } from "ionicons/icons";
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-maats',
    templateUrl: './maats.component.html',
    styleUrls: ['./maats.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    DecimalPipe,
    IonGrid,
    IonRow,
    IonCol,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonIcon,
    IonCard,
    IonInput,
    IonBadge,
    IonItemOption,
    IonItemOptions,
    IonItemSliding
    ]
})
export class MaatsComponent implements OnInit {
    @Input() group: any;
    @Input() accounts: any;
    @Input() country: any;
    @Input() meeting: any;
    allAcounts: any;
    loanAccounts: any;
    creditAccounts: any;
    numberofmembers = 0;
    maxopenloans = 0;
    parameters: any;
    attendance = 0;
    param_rem: any;
    param_emp: any;
    segment = 'reimbursements';
    reimbursements = 0;
    public pf = parseFloat;

    constructor(
        private modalCtrl: ModalController,
        private operationTools: OperationTools,
        private storage: Storage,
        private config: ConfigData
    ) {
        addIcons({ checkmarkSharp, checkmarkCircleSharp, close, informationCircle });
    }

    ngOnInit() {
        this.numberofmembers = this.group.numberofmembers;
        this.accounts = this.accounts.filter(m => m.isPresent);
        this.attendance = this.accounts.length;

        this.allAcounts = this.accounts;
        this.loanAccounts = this.allAcounts.filter(a => parseFloat(a.restearembourser) > 0);

        this.parameters = this.country.parameters;
        this.param_rem = this.parameters.find(p => p.code == 'REM'); // Reimbursement parameter
        this.param_emp = this.parameters.find(p => p.code == 'EMP'); // Loan parameter
        this.maxopenloans = this.group.settings.maxnumopenloans;
        this.readTotals();
    }

    async readTotals() {
        this.reimbursements = 0;
        this.accounts.forEach(async acc => {
            acc.totals = await this.operationTools.estimate_meeting_totals(acc, this.meeting.id);
            if (acc.totals.reimbursements > 0) {
                this.reimbursements++;
            }
            if (acc.dateecheance != null && (new Date(acc.dateecheance) < (new Date()))) {
                acc.loans_expired = true;
            }
        });
    }

    async clear_amount(account: any) {
        await this.operationTools.delOperationByParameter(account.id, this.meeting.id, this.param_rem.id);
        this.readTotals();
    }

    async clear_loan_amount(account: any, event: Event) {
        event.stopPropagation();
        await this.operationTools.delOperationByParameter(account.id, this.meeting.id, this.param_emp.id);
        this.readTotals();
    }

    async set_default(account: any) {
        let categories = "", notes = "";
        await this.operationTools.newOperation(
            this.meeting.id, account, this.group, this.param_rem.id, this.param_rem.name, account.restearembourser, categories, notes);
        this.readTotals();
    }

    /*
    * Register new loan
    *
    */
    async openNewMaat(account: any) {
        let loan_info: any = {};
        let trns = await this.storage.get(this.config.TRANSACTIONS_FILE);
        if (trns) {
            let tr = trns.find((s) => s.idaccount == account.id && s.idmeeting == this.meeting.id && s.idparameter == this.param_emp.id);
            if (tr) {
                loan_info.amount = tr.amount
                loan_info.notes = tr.notes;
            }
        }

        const modal = await this.modalCtrl.create({
            component: LoanInfoComponent,
            componentProps: { account: account, country: this.country, loan_info: loan_info },
            initialBreakpoint: 0.5,
            breakpoints: [0, 0.5, 0.7],
            handle: true,
            cssClass: 'action-modal-sheet'
        });
        await modal.present();

        loan_info = (await modal.onWillDismiss()).data as string;
        if (loan_info) {
            let result = await this.operationTools.newOperation(
                this.meeting.id, account, this.group, this.param_emp.id, this.param_emp.name, loan_info.amount, "", loan_info.notes);
            if (result.status != 'success') {
                this.operationTools.show_alert(result.message);
            }
            this.readTotals();
        }
    }

    async openAccountTransactions(account: any) {
        let categories = ""; let notes = "";

        const modal = await this.modalCtrl.create({
            component: TransactionsComponent,
            componentProps: { group: this.group, account: account, meeting: this.meeting, country: this.country, visible_params: ['REM'] }
        });
        modal.present();

        let acc_transactions = (await modal.onWillDismiss() as any).data;

        // save transactions
        if (acc_transactions) {
            // first clear previous transactions
            await this.operationTools.delAccountOperations(account, this.meeting);
            for (const [parm_id, amount] of Object.entries(acc_transactions)) {
                let prm = this.parameters.find(p => p.id === parm_id);
                let result = await this.operationTools.newOperation(
                    this.meeting.id, account, this.group, parm_id, prm.name, amount, categories, notes);
                if (result.status != 'success') {
                    this.operationTools.show_alert(result.message);
                }
            }
            this.readTotals();
        }
    }

    async showAccountInfo(account, slideitem) {
        slideitem.close();
        const modal = await this.modalCtrl.create({
            component: AccountInfoComponent,
            initialBreakpoint: 0.7,
            breakpoints: [0, 0.7, 1],
            componentProps: { 'account': account, 'currency': this.country.currency },
            cssClass: 'action-modal-sheet'
        });
        modal.present();

        await modal.onWillDismiss();
    }

}
