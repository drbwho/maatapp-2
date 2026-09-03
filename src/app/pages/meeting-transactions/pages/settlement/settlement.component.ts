import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { OperationTools } from '../../../../providers/operation-tools';
import { addIcons } from "ionicons";
import { addCircle, removeCircle } from "ionicons/icons";
import { IonCard, IonGrid, IonRow, IonCol, IonIcon, IonButton, IonList, IonItem, IonLabel, IonAvatar, IonNote } from '@ionic/angular';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { AutofitTextDirective } from '../../../../directives/auto-fit-text.directive';
import { ConfigData } from '../../../../providers/config-data';
import { DataProvider } from '../../../../providers/provider-data';

@Component({
    selector: 'app-settlement',
    templateUrl: './settlement.component.html',
    styleUrls: ['./settlement.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        DecimalPipe,
        IonCard,
        IonGrid,
        IonRow,
        IonCol,
        IonIcon,
        IonList,
        IonItem,
        IonLabel,
        AutofitTextDirective
    ]
})
export class SettlementComponent implements OnInit {
    @Input() group: any;
    @Input() accounts: any;
    @Input() country: any;
    @Input() meeting: any;
    attendance = 0;
    numberofmembers = 0;
    parameters: any;

    constructor(
        private operTools: OperationTools,
        private cdr: ChangeDetectorRef,
        private translate: TranslateService,
        private config: ConfigData,
        private dataProvider: DataProvider
    ) {
        addIcons({ addCircle, removeCircle });
    }

    async ngOnInit() {
        this.numberofmembers = this.group.numberofmembers;
        this.accounts = this.accounts.filter(m => m.isPresent);
        this.attendance = this.accounts.length;
        this.dataProvider.fetch_data('params', this.country.id, true).then((data: any) => {
            this.parameters = data;
        });
        for(const acc of this.accounts){
            acc.show_details = false;
            await this.operTools.estimate_meeting_totals(acc, this.meeting.id).then(data => {
                acc.totals = data;
            });
        };
        this.operTools.estimate_meeting_totals(this.group.account, this.meeting.id).then(data => {
            this.meeting.totals = data;
            this.cdr.detectChanges();
        })
    }


    async read_amounts(account_label, amount){
        var curLang = this.translate.getCurrentLang();
        //get lang iso code
        curLang = await this.config.AVAILABLE_LANGUAGES.find((l) => l.code == curLang).iso_code;

        await TextToSpeech.speak({
          text: account_label,
          lang: curLang,        
          rate: 1.0,           
          pitch: 1.0,     
          volume: 1.0          
        }).then(async ()=>{
          for(let operationid in amount){ 
            if(amount[operationid] && amount[operationid] > 0){
              let parameter = this.parameters.find((s)=> s.id == operationid);
              await TextToSpeech.speak({
                text: parameter.name + ', ' + amount[operationid].toString(),
                lang: curLang,        
                rate: 1.0,           
                pitch: 1.0,     
                volume: 1.0          
              });
            }
          }
        })
    }
}
