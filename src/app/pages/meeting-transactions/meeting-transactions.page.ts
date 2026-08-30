import { Component, OnInit, ChangeDetectionStrategy, ɵDEFAULT_LOCALE_ID, ChangeDetectorRef } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonLabel, IonContent, ModalController, Platform, IonFooter } from '@ionic/angular';
import { DataProvider } from '../../providers/provider-data';
import { OperationTools } from '../../providers/operation-tools';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AutofitService } from '../../directives/auto-fit-text.service';
import { GroupTools } from '../../providers/group-tools';
import { addIcons } from "ionicons";
import { closeOutline, chevronBackOutline } from "ionicons/icons";
import { CommonModule } from '@angular/common';
import { MeetingTotals } from '../../interfaces/data-interfaces';
import { GroupSummaryComponent } from './pages/group-summary/group-summary.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { ContributionsComponent } from './pages/contributions/contributions.component';
import { ActionViewComponent } from '../../component/action-view/action-view.component';
import { BalanceComponent } from './pages/balance/balance.component';
import { EndComponent } from './pages/end/end.component';
import { GroupReviewComponent } from './pages/group-review/group-review.component';
import { MaatsComponent } from './pages/maats/maats.component';
import { SettlementComponent } from './pages/settlement/settlement.component';

@Component({
    selector: 'app-meeting-transactions',
    templateUrl: './meeting-transactions.page.html',
    styleUrls: ['./meeting-transactions.page.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonIcon,
        IonLabel,
        IonContent,
        IonFooter
    ]
})
export class MeetingTransactionsPage implements OnInit {
    private backButtonSubscription: Subscription;
    transactionsPageComponent = null;
    meetingplace: string;
    meetingdate: string;
    groupname: string;
    currency: string;
    group: any;
    groupid: string;
    meeting: any;
    country: any;
    accounts: any;
    status: string;
    fullDate: string;
    num_ECP = 0;
    new_totals: MeetingTotals = {
        debit: 0.00,
        newbalance: 0.00,
        credit: 0.00,
        loans: 0.00
    }
    params: any;
    buttonText: string;
    previousUrl = "";
    pageIndex = 0;

    readonly componentMap = {
        1: { component: GroupSummaryComponent, button: 'confirm_attendance' },
        2: { component: AttendanceComponent, button: 'contributions' },
        3: { component: ContributionsComponent, button: 'balance' },
        4: { component: BalanceComponent, button: 'proceed_to_maats' },
        5: { component: MaatsComponent, button: 'final_settlement' },
        6: { component: SettlementComponent, button: 'our_group' },
        7: { component: GroupReviewComponent, button: 'continue' },
        8: { component: EndComponent, button: 'continue', target: '/app/meetings', load: 'close-meeting' }
    };

    constructor(
        private dataProvider: DataProvider,
        private operTools: OperationTools,
        private translate: TranslateService,
        private router: Router,
        private platform: Platform,
        private autoFit: AutofitService,
        private modalCtrl: ModalController,
        private groupTools: GroupTools,
        private cdr: ChangeDetectorRef
    ) {
        const navigation = this.router.currentNavigation();
        this.previousUrl = navigation?.previousNavigation?.finalUrl?.toString();
        addIcons({ closeOutline, chevronBackOutline });
    }

    async ngOnInit() {
        //Override device back button
        this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(99, () => {
            this.previousPage();
        });

        // Show Group health
        this.group = this.dataProvider.current.group;
        let meetings = await this.groupTools.get_meetings(this.group);
        
        //if(meetings.length > 1){ //Is this the first meeting?
        //  this.show_group_health();
        // } Temporary deactivation ******
    }

    ionViewWillLeave() {
        this.resetPageIndex();
    }

    async ionViewWillEnter() {
        if (this.pageIndex < 0) {
            this.pageIndex = 0;
        }

        this.meeting = this.dataProvider.current.meeting;
        this.meetingplace = this.meeting.place;
        this.meetingdate = this.meeting.startedat;
        this.group = this.dataProvider.current.group;

        this.groupname = this.group.name;
        this.groupid = this.group.id;
        this.country = this.dataProvider.current.country;
        this.num_ECP = await this.operTools.get_num_of_ECP(this.meeting, this.country.id);

        this.dataProvider.fetch_data('params', this.country.id, true).then((data: any) => {
            this.country.parameters = data;
        });

        this.dataProvider.fetch_data('accounts', this.group.id, true, true).then(async (data: any) => {
            this.accounts = data.filter((s) => s.statut == 0 && s.type == 1); //active accounts & member acounts
            this.group.account = data.find((s) => s.idowner == this.group.id);
            this.new_totals = await this.operTools.estimate_meeting_totals(this.group.account, this.meeting.id);
            this.nextPage();
        });
    }

    close() {
        this.router.navigate(['/app/dashboard'], { state: { direction: 'root' } });
    }

    // reset page index on exit and load first action component for future views
    resetPageIndex() {
        this.pageIndex = 0;
        this.transactionsPageComponent = this.componentMap[1].component;
    }

    nextPage() {
        this.pageIndex++;
        this.gotoPage();
    }

    previousPage() {
        this.pageIndex--;
        if (this.pageIndex < 1) {
            if (this.previousUrl == '/new-meeting') { //prevent of going back to new-meeting page
                this.router.navigate(['/app/dashboard'], { state: { direction: 'forward' } });
            } else {
                this.router.navigate([this.previousUrl], { state: { direction: 'forward' } });
            }
            return;
        }
        this.gotoPage();
    }

    gotoPage() {
        // Reset autofit text service for amount views
        this.autoFit.resetGroups();

        if (this.pageIndex > 2 && this.componentMap[this.pageIndex - 1].target != undefined) {
            this.dataProvider.current.meeting = {...this.meeting};
            this.dataProvider.setCurrent(this.dataProvider.current).then(() => {
                if (this.componentMap[this.pageIndex - 1].load) {
                    this.dataProvider.pageAction = this.componentMap[this.pageIndex - 1].load;
                }
                this.router.navigate([this.componentMap[this.pageIndex - 1].target], { state: { direction: 'root' } });
                this.resetPageIndex();
            });
            return;
        }
        this.translate.get(this.componentMap[this.pageIndex].button).subscribe((key) => {
            this.buttonText = key;
            this.params = { group: this.group, accounts: this.accounts, meeting: this.meeting, country: this.country };
            this.transactionsPageComponent = this.componentMap[this.pageIndex].component;
            this.cdr.detectChanges();
        });
    }

    async show_group_health() {
        let group_health: string;
        if (this.group.grouphealth >= 2.8) {
            group_health = 'great';
        } else if (this.group.grouphealth >= 2.6) {
            group_health = 'well';
        } else if (this.group.grouphealth >= 2.5) {
            group_health = 'stable';
        } else {
            group_health = 'attention';
        }

        let lastcollection = this.group.lastmeeting ? parseFloat(this.group.lastmeeting.collection).toFixed(0) : 0;
        let keys = ["total_group_fund", "total_outstanding_maats", "since_last_meeting", "overdue", "members_have_pending_payments"];

        this.translate.get(keys).subscribe(async (keys) => {
            let info: string;
            let badge: any = null;
            if (group_health == 'great' || group_health == 'well') {
                info = "<h1 class='emphassis'>" + parseFloat(this.group.totals.balance).toLocaleString(ɵDEFAULT_LOCALE_ID, { maximumFractionDigits: 0 }) + "</h1> \
          <p class='text-12 ion-no-margin'>" + keys['total_group_fund'] + "</p>";
                badge = { class: 'success', information: lastcollection + " " + keys['since_last_meeting'] }
            } else if (group_health == 'stable') {
                if (parseFloat(this.group.numdueloans) > 0) {
                    info = "<h1 class='emphassis'>" + this.group.numdueloans + "</h1>\
            <p class='text-12 ion-no-margin'>" + keys['members_have_pending_payments'] + "</p>";
                } else {
                    info = "<h1 class='emphassis'>" + parseFloat(this.group.totals.balance).toLocaleString(ɵDEFAULT_LOCALE_ID, { maximumFractionDigits: 0 }) + "</h1> \
            <p class='text-12 ion-no-margin'>" + keys['total_group_fund'] + "</p>";
                    badge = { class: 'success', information: lastcollection + " " + keys['since_last_meeting'] }
                }
            } else if (group_health == 'attention') {
                info = "<h1 class='ion-no-margin'>" + parseFloat(this.group.totals.restearembourser).toLocaleString(ɵDEFAULT_LOCALE_ID, { maximumFractionDigits: 0 }) + "</h1>\
          <p class='text-12 ion-no-margin'>" + keys['total_outstanding_maats'] + "</p>";
                if (parseFloat(this.group.numdueloans) > 0) {
                    badge = { class: 'danger', information: this.group.numdueloans + " " + keys['overdue'] }
                }
            }

            const modal = await this.modalCtrl.create({
                component: ActionViewComponent,
                componentProps: {
                    alttitle: this.group.name,
                    heading: 'messages.accounts.' + group_health + '.heading',
                    description: 'messages.accounts.' + group_health + '.description',
                    information: info,
                    badge: badge,
                    image: 'assets/img/action-views/' + group_health + '-group.png',
                    hasBackButton: false,
                    buttons: [{ text: 'continue', color: 'primary' }]
                },
                cssClass: ''
            });
            await modal.present();
        });
    }
}
