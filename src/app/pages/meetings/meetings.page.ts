import { Component, OnInit, ViewChild, ChangeDetectionStrategy, signal } from '@angular/core';
import { DataProvider, Meeting } from '../../providers/provider-data';
import { IonModal, NavController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonAvatar, IonContent, IonList, IonItem, IonLabel, IonIcon, IonNote, ActionSheetController, IonBackButton } from '@ionic/angular/standalone';
import { GroupTools } from '../../providers/group-tools';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MeetingsActionViews } from './meetings.action-views';
import * as XLSX from 'xlsx';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Platform } from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { UserData } from '../../providers/user-data';
import { addIcons } from "ionicons";
import { caretForwardOutline, chevronBack, chevronBackOutline, closeCircle, closeOutline, cloudUpload, pause, statsChart, warningOutline } from "ionicons/icons";
import { CommonModule, DatePipe } from '@angular/common';
import { MeetingCardComponent } from '../../component/meeting-card/meeting-card.component';

@Component({
    selector: 'app-meetings',
    templateUrl: './meetings.page.html',
    styleUrls: ['./meetings.page.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [IonBackButton,
        CommonModule,
        TranslatePipe,
        DatePipe,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonBackButton,
        IonAvatar,
        IonContent,
        IonList,
        IonItem,
        IonLabel,
        IonIcon,
        IonNote,
        IonModal,
        RouterLink,
        MeetingCardComponent
    ]
})

export class MeetingsPage implements OnInit {
    @ViewChild(IonModal) modal!: IonModal;
    user: any = null;
    group = { id: "", name: "", ville: "", numberofmembers: 0 }
    country = { id: "", name: "", currency: "", flagcode: "gb" };
    lastmeeting: any = {};
    meeting_status = "";
    meetings: Meeting[] = [];
    show_all = false;
    selmeeting: any = null;
    upload_errors: any = [];

    constructor(
        private dataProvider: DataProvider,
        private navCtrl: NavController,
        private groupTools: GroupTools,
        private translate: TranslateService,
        private actionSheetCtrl: ActionSheetController,
        private route: ActivatedRoute,
        private meetActionViews: MeetingsActionViews,
        private userData: UserData,
        private storage: Storage,
        private config: ConfigData,
        private platform: Platform
    ) {
        addIcons({
          closeOutline, chevronBackOutline, warningOutline, caretForwardOutline, cloudUpload,
          pause, statsChart, closeCircle, chevronBack });
    }

    async ngOnInit() {
        this.user = await this.userData.getUser();

        this.route.url.subscribe(() => {
            if (this.dataProvider.pageAction == 'close-meeting') {
                this.dataProvider.pageAction = null;
                this.show_action_view(null, 'upload-close');
            }
        });
    }

    ionViewWillEnter() {
        this.load_currents();
    }

    async load_currents() {
        var current = await this.dataProvider.getCurrent();
        if (!current || current.country == undefined) {
            this.navCtrl.navigateForward('/countries');
        } else if (!current.group) {
            this.navCtrl.navigateForward('/country/' + current.country.id + '/groups');
        } else {
            this.country = current.country;
            this.group = current.group;
            this.meetings = await this.groupTools.get_meetings(this.group);
            this.lastmeeting = await this.groupTools.get_last_meeting(this.meetings);
            this.meeting_status = await this.groupTools.get_group_meeting_status(this.meetings, this.group.id);
            this.meetings.forEach(m => {
                m.attendance = this.group.numberofmembers - (m.absences ? m.absences.length : 0);
            })
        }
    }

    /*
    * Options Action Sheet
    *
    */
    async openOptions(meeting: Meeting) {
        this.translate.get(['continue_meeting', 'upload_data', 'close_meeting', 'view_transactions', 'download_excel', 'cancel_meeting', 'upload_errors', 'return']).subscribe(async (keys: any) => {
            let buttons = [];

            if (this.user.role > 1) {
                if (!meeting.endedat) {
                    buttons.push({
                        text: keys['continue_meeting'],
                        icon: 'caret-forward-outline',
                        cssClass: 'action-sheet-primary',
                        handler: () => {
                            this.dataProvider.current.meeting = meeting;
                            this.navCtrl.navigateForward('/meeting-transactions');
                        },
                    });
                }
                if (meeting.pending || meeting.haspending) {
                    buttons.push({
                        text: keys['upload_data'],
                        icon: 'cloud-upload',
                        cssClass: meeting.endedat ? 'action-sheet-primary' : '',
                        handler: () => {
                            this.show_action_view(meeting, 'upload-close');
                        },
                    });
                }
                if (!meeting.endedat) {
                    buttons.push({
                        text: keys['close_meeting'],
                        icon: 'pause',
                        handler: () => {
                            this.show_action_view(meeting, 'upload-close').then(() => {
                                this.load_currents();
                            });
                        },
                    });
                }
            }
            buttons.push({
                text: keys['view_transactions'],
                icon: 'stats-chart',
                handler: () => {
                    this.show_action_view(meeting, 'view-transactions');
                },
            });
            if (meeting.endedat) {
                buttons.push({
                    text: keys['download_excel'],
                    icon: 'assets/img/icons/excel-icon.svg',
                    handler: () => {
                        this.exportToExcel(meeting);
                    },
                });
            }
            if (this.user.role > 1) {
                if (meeting.pending) {
                    buttons.push({
                        text: keys['cancel_meeting'],
                        icon: 'close-circle',
                        role: 'destructive',
                        handler: () => {
                            this.show_action_view(meeting, 'cancel');
                        }
                    });
                }
            }

            this.upload_errors = await this.storage.get(this.config.UPLOAD_ERRORS_FILE);
            if (this.upload_errors) {
                this.upload_errors = this.upload_errors.filter((s) => s.idmeeting == meeting.id);
                buttons.push({
                    text: keys['upload_errors'],
                    icon: 'warning-outline',
                    role: 'destructive',
                    handler: () => {
                        this.selmeeting = meeting;
                        this.showUploadErrors();
                    }
                });
            }

            buttons.push({
                text: keys['return'],
                role: 'cancel',
                icon: 'chevron-back'
            });

            const actionSheet = await this.actionSheetCtrl.create({
                header: meeting.place,
                cssClass: 'settings-action-sheet ion-padding',
                buttons: buttons
            });
            await actionSheet.present();
        })
    }


    /*
    * Show Meetings Action Views
    *
    */
    async show_action_view(meeting: Meeting, action: string) {
        if (!meeting) {
            meeting = this.dataProvider.current.meeting;
        }
        switch (action) {
            //--- upload or close meeting
            case 'upload-close':
                if (meeting.pending || meeting.haspending) {
                    this.meetActionViews.show_action_upload_close(meeting).then(async (res: any) => {
                        if (res.success) {
                            if (res.action == 'upload') { // return from uploading
                                // upload succeed
                                this.meetActionViews.show_action_upload_success(meeting).then((res: any) => {
                                    if (res.action == 'history') {
                                        this.dataProvider.current.meeting = meeting;
                                        this.navCtrl.navigateForward('/meeting-history');
                                    }
                                    this.load_currents(); // refreshing...
                                });
                            }
                            this.load_currents();
                            this.navCtrl.navigateRoot('/app/meetings');
                        } else {
                            // upload failed
                            this.meetActionViews.show_action_upload_failed(meeting).then(async (res: any) => {
                                if (res.action == 'tryagain') {
                                    this.navCtrl.navigateRoot('/app/meetings/close');
                                } else {
                                    this.navCtrl.navigateRoot('/app/meetings');
                                }
                            })
                        }
                    });
                } else {
                    this.meetActionViews.show_action_upload_success(meeting).then(async (res: any) => {
                        if (res.action == 'history') {
                            this.dataProvider.current.meeting = meeting;
                            this.navCtrl.navigateForward('/meeting-history');
                        }
                        this.load_currents();
                        this.navCtrl.navigateRoot('/app/meetings');
                    });
                }
                break;
            //--- View meeting's transactions
            case 'view-transactions':
                let meet_status = '';
                if (meeting.pending || meeting.haspending) {
                    meet_status = 'upload-close';
                    //}else{
                    //  meet_status = await this.groupTools.get_meeting_health(meeting, this.group);
                    //}
                    this.meetActionViews.show_action_view_transactions(meeting, meet_status, this.country.currency).then(data => {
                        if (data != 'close' && data != 'return') {
                            this.dataProvider.current.meeting = meeting;
                            this.navCtrl.navigateForward('/meeting-history');
                        }
                    });
                } else {
                    this.dataProvider.current.meeting = meeting;
                    this.navCtrl.navigateForward('/meeting-history');
                }
                break;
            //--- cancel/suspend meeting
            case 'cancel':
                this.meetActionViews.show_action_cancel(meeting).then(async (res: any) => {
                    if (res.success) {
                        this.load_currents();
                        this.navCtrl.navigateRoot('/app/meetings');
                    }
                });
                break;
        }
    }

    async exportToExcel(meeting: any) {
        let fileName: string = 'MAAT_' + meeting.place + '_' + meeting.startedat + '.xlsx';

        const headerInfo = [
            ['MA\'AT - Meeting Operations'],
            ['Country:', this.country.name, 'Group:', this.group.name],
            ['Meeting:', meeting.place + ' / ' + meeting.startedat],
            [], // space
        ];
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(headerInfo);

        let accounts = await this.dataProvider.fetch_data('accounts', this.group.id, true, true);
        let params = await this.dataProvider.fetch_data('params', this.country.id, true);
        let transactions = await this.storage.get(this.config.HISTORY_TRANSACTIONS_FILE);
        const data = transactions.map(tr => ({
            'From account': (accounts.find(a => a.id == tr.idorigin)).owner,
            'To account': (accounts.find(a => a.id == tr.idaccount)).owner,
            'Operation': (params.find(p => p.id == tr.idparameter)).name,
            'Amount': tr.credit ? tr.credit : tr.debit,
            'Date': tr.operationdate,
            'Notes': tr.notes
        }));
        XLSX.utils.sheet_add_json(ws, data, { origin: 'A5', skipHeader: false });
        ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 20 }, { wch: 10 }]; // Widths

        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

        const excelBuffer: string = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        try {
            if (this.platform.is('hybrid')) { // device
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: excelBuffer,
                    directory: Directory.Documents,
                    recursive: true
                });

                await Share.share({
                    title: this.group.name + '/' + meeting.place + ':' + meeting.staertedat,
                    text: 'MAAT meeting transactions',
                    url: savedFile.uri,
                    dialogTitle: 'File open'
                });

            } else {
                XLSX.writeFile(wb, fileName);
            }
        } catch (error) {
            console.error('Error saving excel file', error);
        }
    }

    async showUploadErrors() {
        this.modal.present();
    }

    closeModal() {
        this.modal.dismiss();
    }

}
