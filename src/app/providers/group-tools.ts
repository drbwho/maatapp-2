import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from './config-data';
import { DataProvider } from './provider-data';

@Injectable({
  providedIn: 'root'
})
export class GroupTools {

  constructor(
    private storage: Storage,
    private config: ConfigData,
    private dataProvider: DataProvider
  ){}

  get_meetings(group: any){
    return this.dataProvider.fetch_data('meetings', group.id, true, true).then(async (data: any)=> {
      // merge with local stored new meetings
      var newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
      let meetings = [];
      if(newmeetings != null && newmeetings.length){
        newmeetings = newmeetings.filter(s => s.idgroup == group.id);
        meetings = [...newmeetings, ...data];
      }else{
        meetings = data;
      }
      // check if meeting has pending transactions to upload
      meetings.forEach(async (m)=>{
        m.haspending = 0;
        this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
          if(trns && (trns.filter(s => s.meetingid == m.id)).length){
            m.haspending = (trns.filter(s => s.meetingid == m.id)).length;
          }
        });
        m.collection = Math.round(m.collection); // parse collected amount as float
      })
      return meetings;
    });
  }

  async has_to_upload (groupId){
    var res = await this.storage.get(this.config.TRANSACTIONS_FILE);
    if(res){
      res = res.filter((a)=> a.idgroup == groupId);
    }
    var newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
    if(newmeetings){
      newmeetings = newmeetings.filter((a)=> a.idgroup == groupId);
    }
    if((res && res.length) || newmeetings && newmeetings.length){
      return true;
    }
    return false;
  }

  async get_meeting_status(meetings, groupId){
    var upload_status = await this.has_to_upload(groupId);
    if(!meetings.length || !meetings){
      return "no-meetings";
    }

    let open_meetings = meetings.filter((a) => !a.endedat).length;

    if(open_meetings && !upload_status){
      return "in-progress";
    }else if(!open_meetings && !upload_status){
      return "no-active";
    }else if(open_meetings && upload_status && this.dataProvider.networkStatus){
      return "saved-local";
    }else if(open_meetings && upload_status && !this.dataProvider.networkStatus){
      return "saved-offline";
    }
    return null;
  }

  get_last_meeting(meetings){
    return meetings.reduce((prev, current) => {
      return (prev.startedat > current.startedat) ? prev : current;
    });
  }

  get_group_status(group: any){
    const params = ["on_time_loans", "reg_contributions", "attendance", "value_balance_loans", "value_credit", "collectives"];
    const weights ={
      [params[0]]: { high: 0.9, low: 0.6, weight: 0.3 },
      [params[0]]: { high: 0.9, low: 0.6, weight: 0.2 },
      [params[0]]: { high: 0.8, low: 0.5, weight: 0.15 },
      [params[0]]: { high: 1, low: 1, weight: 0.15 },
      [params[0]]: { high: 0.4, low: 0.2, weight: 0.1 },
      [params[0]]: { high: 18, low: 0.6, weight: 0.1 }
    };

    let values = [];
    values.push(group.numofloans ? group.paidloans / group.numofloans : 0);


    return 2;
  }

}
