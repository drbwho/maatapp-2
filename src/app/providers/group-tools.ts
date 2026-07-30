import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from './config-data';
import { DataProvider, Meeting } from './provider-data';
import { OperationTools } from './operation-tools';

export interface HealthMetric {
  value: number;
  message: string;
  weight: number;
}

type MeetingMetrics = Record<string, HealthMetric>;

let meeting_metrics: MeetingMetrics = {
  ontime_repayments: { 
    value: 0.0,
    message: 'ontime_repayments',
    weight: 0.3
  },
  perc_rcb: {
    value: 0.0,
    message: 'percentage_of_rcb',
    weight: 0.2
  },
  perc_attendance: {
    value: 0.0,
    message: 'percentage__of_attendance',
    weight: 0.15
  },
  balance_loans: {
    value: 0.0,
    message: 'value_balance_plus_loans',
    weight: 0.15
  },
  perc_credit_req: {
    value: 0.0,
    message: 'percentage_of_credit_requested',
    weight: 0.1
  },
  collective_act: {
    value: 0.0,
    message: 'sign_of_collective_activities',
    weight: 0.1
  }
}

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

  /*
  * Get Meeting Status (Closed, need syncing etc.)
  *
  */
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

  /*
  * Calculate Meeting Health index
  *
  */
  async get_meeting_health(meeting: any, group: any){
    //zero metrics
    Object.values(meeting_metrics).forEach(metric => {
      metric.value = 0;
    });

    let totals = await this.operTools.estimate_meeting_totals(null, meeting.id);
    let params = await this.storage.get(this.config.GET_FILE('params'));
    
    let alltransactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
    let uploaded = await this.storage.get(this.config.HISTORY_TRANSACTIONS_FILE);
    //merge local and uploaded transactions
    if(alltransactions && uploaded){
      alltransactions = [...alltransactions, ...uploaded];
    }else if(uploaded){
      alltransactions = uploaded;
    }
    alltransactions = alltransactions.filter((tr)=> tr.idmeeting === meeting.id);

    //1. Ontime loan repayments
    let paramid = (params.find((s) => s.code == 'REM')).id;
    let transactions = alltransactions.filter((tr)=> tr.idparameter === paramid);

    let num_noexpired_repayments = 0;
    let num_current_loans = 0;
    await this.dataProvider.fetch_data('accounts', group.id, true, true).then(async (data: any)=> {
      let accounts = data;
      transactions.forEach((tr:any) => {
        let acc = accounts.find(ac => ac.id == tr.idorigin);
        if( acc && acc.dateecheance != null && (new Date(acc.dateecheance) >= (new Date(meeting.startedat)))){
          num_noexpired_repayments++;
        }
      });
      accounts.forEach((acc:any)=>{
        if(acc.dateecheance != null && (new Date(acc.dateecheance) >= (new Date(meeting.startedat)))){
          num_current_loans++;
        }
      })
    });

    let ontime_repayments = 0;
    num_current_loans == 0 ? ontime_repayments = 0 : ontime_repayments = (num_noexpired_repayments / num_current_loans) * 100;
    meeting_metrics.ontime_repayments.value = ontime_repayments;

    //2. Regular contributions
    paramid = (params.find((s) => s.code == 'RCB')).id;
    transactions = alltransactions.filter((tr)=> tr.idparameter === paramid);
    let num_rcb = transactions.length;
    let perc_rcb = (num_rcb / group.numberofmembers) * 100;
    meeting_metrics.perc_rcb.value = perc_rcb;

    //3. Attendance
    let perc_attendance = 0;
    !meeting.attendance ? 
      perc_attendance = 100 : perc_attendance = (meeting.attendance / group.numberofmembers) * 100;
    meeting_metrics.perc_attendance.value = perc_attendance; 

    //4. Balance + loans
    let ECP_total = totals.transactions.get('ECP') ?? 0;
    let EMP_total = totals.transactions.get('EMP') ?? 0;
    let balance_loans = 0;
    ECP_total > EMP_total ? balance_loans = 100 : balance_loans = 0;
    meeting_metrics.balance_loans.value = balance_loans;

    //5. Value of Credit
    let perc_credit_req = 0;
    let num_credit_req = totals.transactions.get('DPR') ?? 0;
    let num_ecp = totals.transactions.get('ECP') ?? 0;
    num_ecp > 0 ? perc_credit_req = (num_credit_req / num_ecp) * 100 : perc_credit_req = 0;
    meeting_metrics.perc_credit_req.value = perc_credit_req;

    //6. Collective activity
    let collective_act = 0;
    let num_coll_act = new Map(
      [...totals.transactions].filter(([key, value]) => key == 'PCO')
    ).size;
    num_coll_act > 0 ? collective_act = 100 : collective_act = 0;
    meeting_metrics.collective_act.value = collective_act;

    //Calculate total health index
    let total = Object.values(meeting_metrics).reduce((sum, metric) => {
      return sum + (metric.value * metric.weight);
    }, 0);

    console.log(ontime_repayments,perc_rcb,perc_attendance,balance_loans,perc_credit_req,collective_act,'=',total);

    let health_status = 'great';
    if(total < 80){
      health_status = 'good';
    }
    if(total <= 60){
      health_status = 'stable';
    }
    if(total < 50){
      health_status = 'action';
    }
    return {health_status: health_status, meeting_metrics: meeting_metrics}
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
