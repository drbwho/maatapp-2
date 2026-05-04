import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from './config-data';
import { DataProvider, Meeting } from './provider-data';
import { OperationTools } from './operation-tools';

@Injectable({
  providedIn: 'root'
})
export class GroupTools {

  constructor(
    private storage: Storage,
    private config: ConfigData,
    private dataProvider: DataProvider,
    private operTools: OperationTools
  ){}

  get_meetings(group: any){ 
    return this.dataProvider.fetch_data('meetings', group.id, true, true).then(async (data: any)=> {
      // merge with local stored new meetings
      var newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
      let meetings:Meeting[] = [];
      if(newmeetings != null && newmeetings.length){
        newmeetings = newmeetings.filter(s => s.idgroup == group.id);
        meetings = [...newmeetings, ...data];
      }else{
        meetings = data;
      }
      // check if meeting has pending transactions to upload
      for(const m of meetings){
        m.haspending = 0;
        let trns = await this.storage.get(this.config.TRANSACTIONS_FILE);
        if(trns && (trns.filter(s => s.idmeeting == m.id)).length){
          m.haspending = (trns.filter(s => s.idmeeting == m.id)).length;
          let totals: any = await this.operTools.estimate_meeting_totals(null, m.id);
          m.collection = totals.credit - totals.debit;
        }else{
          m.collection = Math.round(m.collection); // parse collected amount as float
        }
        //convert absences json from API to array
        if (m.absences && typeof m.absences === 'string') {
          m.absences = JSON.parse(m.absences);
        }
      }
      return meetings;
    });
  }

  async has_to_upload (groupId: string){
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

  async get_group_meeting_status(meetings, groupId: string){
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

  async get_meeting_health(meeting: any, group: any){
    let totals = await this.operTools.estimate_meeting_totals(null, meeting.id);

    //1. Ontime loan repayments
    let num_reimbursements = new Map(
      [...totals.transactions].filter(([key, value]) => key == 'REM')
    ).size;

    let num_noexpired_loans = 0;
    await this.dataProvider.fetch_data('accounts', group.id, true, true).then(async (data: any)=> {
      let accounts = data.filter((s)=> s.statut == 0 && s.type == 1); //active accounts & member acounts
      accounts.forEach(async (acc) => {
        //Number of overdue loans during meeting
        if( acc.dateecheance != null && (new Date(acc.dateecheance) <= (new Date(meeting.startedat)))){
          num_noexpired_loans++;
        }
      });
    });

    let ontime_repayments = 0;
    (num_reimbursements > num_noexpired_loans) || num_noexpired_loans == 0 ?
      ontime_repayments = 100 : ontime_repayments = (num_reimbursements / num_noexpired_loans) * 100;
    ontime_repayments *= 0.3 // weight 30%
  
    //2. Regular contributions
    let num_rcb = new Map(
      [...totals.transactions].filter(([key, value]) => key == 'RCB')
    ).size;
    let perc_rcb = (num_rcb / group.numberofmembers) * 100;
    perc_rcb *= 0.2 // weight 20%

    //3. Attendance
    let perc_attendance = 0;
    !meeting.attendance ? 
      perc_attendance = 100 : perc_attendance = (meeting.attendance / group.numberofmembers) * 100;
    perc_attendance *= 0.15; // weight 15%

    //4. Balance + loans
    let ECP_total = totals.transactions.get('ECP');
    let EMP_total = totals.transactions.get('EMP');
    let balance_loans = 0;
    ECP_total > EMP_total ? balance_loans = 100 : balance_loans = 0;
    balance_loans *= 0.1 // weight 15%

    //5. Value of Credit
    let perc_credit_req = 0;
    let num_credit_req = new Map(
      [...totals.transactions].filter(([key, value]) => key == 'AID') //??????
    ).size;
    let num_ecp = new Map(
      [...totals.transactions].filter(([key, value]) => key == 'ECP')
    ).size;
    num_credit_req > 0 && num_ecp > 0 ? perc_credit_req = (num_credit_req / num_ecp) * 100 : perc_credit_req = 0;
    perc_credit_req *= 0.1; //weight 10%

    //6. Collective activity
    let collective_act = 0;
    let num_coll_act = new Map(
      [...totals.transactions].filter(([key, value]) => key == 'PCO') //?????????
    ).size;
    num_coll_act > 0 ? collective_act = 100 : collective_act = 0;
    collective_act *= 0.1 //weight 10%;

    let total = ontime_repayments + perc_rcb + perc_attendance + balance_loans + perc_credit_req + collective_act;
    console.log(ontime_repayments,perc_rcb,perc_attendance,balance_loans,perc_credit_req,collective_act);

    console.log(total)
    if(total < 50){
      return 'action';
    }
    if(total <= 60){
      return 'stable';
    }
    if(total < 80){
      return 'good';
    }
    return 'great';
  }

  async get_meeting_health_OLD(meeting: any, group: any){
    let totals = await this.operTools.estimate_meeting_totals(null, meeting.id);
    let trans = new Map(
      [...totals.transactions].filter(([key, value]) => this.operTools.contrib_operations.includes(key))
    );
    
    let paid_contribs = 0.0;
    let expected_contribs = 0.0;
    for (const [code, value] of trans) {
      paid_contribs += value as number;
    }
    for (const code of this.operTools.contrib_operations) {
      expected_contribs += parseFloat(group.settings[this.operTools.map_default_to_settings[code]]);
    }
    expected_contribs *= group.numberofmembers;

    let has_ECP = totals.transactions.get('ECP') ? true : false;
    let percentage = 0.0;
    if(trans){
      percentage = paid_contribs / expected_contribs;
    }
    if(percentage < 0.5){
      return 'action';
    }
    if(percentage <= 0.8){
      return 'stable';
    }
    if(percentage < 0.9){
      return 'good';
    }
    return 'great';
  }

  async get_last_meeting(meetings){
    if(!meetings || !meetings.length){
      return null;
    }
    let last = meetings.reduce((prev, current) => {
      return (prev.startedat >= current.startedat) ? prev : current;
    });
    return last;
  }
}
