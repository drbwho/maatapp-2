import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ConfigData } from '../../providers/config-data';
import { OperationTools } from '../../providers/operation-tools';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    standalone: false
})
export class HistoryComponent implements OnInit {
  @Input() meeting: any;
  operations: any;
  meetingplace = "";
  meetingdate = "";

  constructor(
    private modalCtrl: ModalController,
    private config: ConfigData,
    private operationTools: OperationTools
  ) { }

  ngOnInit() {
    this.meetingplace = this.meeting.place;
    this.meetingdate = this.meeting.startedat;

    this.operationTools.getHistory(this.meeting).then((data: any)=>{
      this.operations = data.operations;
    })
  }

  dismiss(){
    this.modalCtrl.dismiss();
  }

}
