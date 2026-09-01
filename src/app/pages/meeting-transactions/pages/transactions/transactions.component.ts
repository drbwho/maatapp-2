import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonGrid, IonRow, IonCol, IonLabel, IonAvatar, IonNote, IonInput, IonList, IonItem, IonFooter, IonCard, IonBadge } from '@ionic/angular';
import { DataProvider } from '../../../../providers/provider-data';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../../../providers/config-data';
import { OperationTools } from '../../../../providers/operation-tools';
import { Transaction } from '../../../../interfaces/data-interfaces';
import { addIcons } from "ionicons";
import { closeOutline, chevronBackOutline, checkmarkSharp, checkmarkCircleSharp, close } from "ionicons/icons";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AutofitTextDirective } from '../../../../directives/auto-fit-text.directive';

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonLabel,
    IonNote,
    IonInput,
    IonList,
    IonItem,
    IonFooter,
    IonCard,
    IonBadge,
    AutofitTextDirective
]
})
export class TransactionsComponent implements OnInit {
    @Input() account: any;
    @Input() meeting: any;
    @Input() country: any;
    @Input() group: any;
    @Input() visible_params?: any;
    parameters: any;
    contrib_params: any;
    amount: number[] = [];
    param_error: string[] = [];
    loans_expired = false;
    show_more = false;
    show_details = false;
    tr_icons: any;
    public pf = parseFloat;

    constructor(
        private modalCtrl: ModalController,
        private operTools: OperationTools,
        private storage: Storage,
        private config: ConfigData,
        private cdr: ChangeDetectorRef
    ) {
        addIcons({ closeOutline, chevronBackOutline, checkmarkSharp, checkmarkCircleSharp, close });
    }

    ngOnInit() {
        this.tr_icons = this.operTools.tr_icons;
        var account_type = this.account.type;
        this.parameters = this.country.parameters.filter((s: any) => (account_type == 1 ? s.type == 1 : s.type == 2)); //paysants/group operations
        //this.fsparameters = data.filter((s) => s.type == 3); //solidarity operations
        // default contribs
        for(const p of this.parameters){
            p.showdefault = false;
            if (this.operTools.contrib_operations.includes(p.code)) {
                let amount = parseFloat(this.group.settings[this.operTools.map_default_to_settings[p.code]]);
                if (amount) {
                    p.default = amount + this.has_contributions_dues(this.account, p);
                    p.default < 0 ? p.default = 0 : null; // value cannot be negative
                } else {
                    p.default = 0;
                }
                p.showdefault = true;
            }
        }
        if (this.account) {
            //load account's pending operations
            this.storage.get(this.config.TRANSACTIONS_FILE).then((trns) => {
                if (trns) {
                    let transactions = trns.filter((s: any) => s.idaccount == this.account.id && s.idmeeting == this.meeting.id);
                    if (transactions) {
                        for(const tr of transactions){
                            this.amount[tr.idparameter] = tr.amount;
                            //if(tr.categories.length){
                            //  this.loan_info.categories = tr.categories;
                            //}
                            //if(tr.notes){
                            // this.loan_info.notes = tr.notes;
                            //}
                        }
                    }
                }
                this.cdr.detectChanges();
            });
            if (this.account.dateecheance != null && (new Date(this.account.dateecheance) < (new Date()))) {
                this.loans_expired = true;
            }
        }
        this.cdr.detectChanges();
    }

    set_default(parameter: any) {
        if (!parameter) { return; }
        if (parameter.default != undefined) {
            this.amount[parameter.id] = parameter.default;
        }
        this.cdr.detectChanges();
    }

    has_contributions_dues(account: any, prm: any): any {
        if (account.due_reg && prm.code == 'RCB') {
            return parseFloat(account.due_reg);
        } else if (account.due_sf && prm.code == 'AID') {
            return parseFloat(account.due_sf);
        } else if (account.due_facp && prm.code == 'AST') {
            return parseFloat(account.due_facp);
        }
        return 0;
    }

    clear_amount(parameterId: string) {
        delete (this.amount[parameterId as keyof typeof this.amount]);
        delete (this.param_error[parameterId as keyof typeof this.param_error]);
        this.cdr.detectChanges();
    }

    async dismiss(returndata = false) {
        if (returndata) {
            if (await this.check_operations()) {
                this.modalCtrl.dismiss(this.amount);
            }
        } else {
            this.modalCtrl.dismiss();
        }
    }

    async check_operations() {
        let check = true;
        for (const [parameterId, amount] of Object.entries(this.amount)) {
            let param = this.parameters.find((p: any) => p.id == parameterId);
            let tr: Transaction = {
                idmeeting: this.meeting.id,
                idaccount: this.account.id,
                idparameter: param.id,
                parametername: param.name,
                amount: amount,
                inputdate: new Date()
            }
            let result: any = await this.operTools.check_operation(this.account, this.group, tr);
            if (result.status != 'success') {
                this.param_error[param.id] = result.message;
                check = false;
            }
        }
        return check;
    }
}
