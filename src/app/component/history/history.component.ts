import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ConfigData } from '../../providers/config-data';
import { DataProvider } from '../../providers/provider-data';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  @Input() meeting: any;
  operations: any;
  meetingplace = "";
  meetingdate = "";

  constructor(
    private modalCtrl: ModalController,
    private config: ConfigData,
    private dataProvider: DataProvider
  ) { }

  ngOnInit() {
    this.meetingplace = this.meeting.place;
    this.meetingdate = this.meeting.startedat;

    this.dataProvider.getHistory(this.meeting).then((data: any)=>{
      this.operations = data.operations;
    })
  }

  dismiss(){
    this.modalCtrl.dismiss();
  }

}
