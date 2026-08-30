import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NavController, Platform, IonHeader, IonToolbar, IonTitle, IonLabel, IonButtons, IonBackButton, IonSearchbar, IonContent, IonList, IonItem, IonAvatar, IonIcon, IonNote, IonBadge } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { addIcons } from "ionicons";
import { checkmarkCircle, chevronBackOutline } from "ionicons/icons";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-groups',
    templateUrl: './groups.page.html',
    styleUrls: ['./groups.page.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslatePipe,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonLabel,
        IonButtons,
        IonBackButton,
        IonSearchbar,
        IonContent,
        IonList,
        IonItem,
        IonIcon,
        IonBadge
    ]
})
export class GroupsPage implements OnInit {
    private backButtonSubscription: Subscription;
    country: any;
    groups: any;
    countryname: any;
    queryText: string;
    searchPlaceholder: string;
    currentid: 0;
    group_selected = false;

    constructor(
        private dataProvider: DataProvider,
        private route: ActivatedRoute,
        private storage: Storage,
        private config: ConfigData,
        private translate: TranslateService,
        private navController: NavController,
        private platform: Platform
    ) {
        addIcons({ checkmarkCircle, chevronBackOutline });
    }

    ngOnInit() {
        //Override device back button
        if (!this.dataProvider.current.group) {
            this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(99, () => {
                return;
            });
        }
    }

    async ionViewWillEnter() {
        const countryId = this.route.snapshot.paramMap.get('countryId');

        if (!this.dataProvider.current.group) {
            this.group_selected = false;
        } else {
            this.group_selected = true;
        }

        this.dataProvider.fetch_data('countries', null, false, true).then(async (data: any) => {
            this.country = data.find((s) => s.id == countryId);
            this.groups = this.country.groups.filter(g => g.type == 1); //filter Direction Groups
            this.countryname = this.country.name;
            //Load Country's parameters
            this.dataProvider.fetch_data('params', this.country.id, true).then((data: any) => {
                this.storage.set(this.config.GET_FILE('params'), data);
            });
            let newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
            this.groups.forEach(g => {
                g.active = true;
                if ((g.lastmeeting && g.lastmeeting.endedat) || !g.lastmeeting) {
                    g.active = false;
                }
                if (newmeetings && newmeetings.find(m => m.idgroup == g.id)) {
                    g.active = true;
                }
            });
        });

        this.translate.get('search').subscribe((keys: any) => {
            this.searchPlaceholder = keys;
        })

        var current = await this.dataProvider.getCurrent();
        if (current && current.group) {
            this.currentid = current.group.id;
        }
    }

    async navto(group) {
        // Set current group
        var current = await this.dataProvider.getCurrent();
        current.group = group;
        current.need_refresh = true; // Force refresh
        this.dataProvider.setCurrent(current).then(() => {
            this.navController.navigateRoot('/app/dashboard', {
                animated: true,
                animationDirection: 'forward'
            });
        });
    }

    searcher() {
        if (this.queryText == '') {
            this.groups = this.country.groups;
            return;
        }

        let queryText = this.queryText.toLowerCase().replace(/,|\.|-/g, ' ');
        const queryWords = queryText.split(' ').filter(w => !!w.trim().length);

        this.groups = [];
        let groups = this.country.groups;
        groups.forEach((gr: any) => {
            if (queryWords.length) {
                queryWords.forEach((queryWord: string) => {
                    if (gr.name.toLowerCase().indexOf(queryWord) > -1) {
                        this.groups.push(gr);
                    }
                });
            }
        });
    }

}
