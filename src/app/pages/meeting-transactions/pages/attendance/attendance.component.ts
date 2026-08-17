import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { DataProvider } from '../../../../providers/provider-data';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class AttendanceComponent  implements OnInit {
  @Input() group: any;
  @Input() accounts: any;
  @Input() meeting: any;
  numberofmembers = 0;
  attendance = 0;
  accountids = [];
  transactions_exist = false;

  constructor(
    private providerData: DataProvider
  ) { }

  ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    //load attendance
    if(this.meeting.absences != undefined){
      this.accounts.map(a => { if(this.meeting.absences.includes(a.id)){ a.isPresent = false; }else{ a.isPresent = true} });
    }else{
      this.accounts.map(a => a.isPresent = true);
    }
    this.calcAttendance();
  }

  togglePresence(account: any) {
    //prohibition of changes if transactions exist
    if(this.meeting.haspending || this.meeting.has_transactions){
      if(account.isPresent){
        return;
      }
    }
    account.isPresent = !account.isPresent;
    this.calcAttendance();
  }

  async calcAttendance(){
    this.attendance = this.accounts?.filter(m => m.isPresent).length;
    this.accountids = this.accounts?.filter(m => !m.isPresent)
      .reduce((a, {id})=>{
        a.push(id);
        return a;
      },[]);
    this.meeting.absences = this.accountids;
    this.providerData.current.meeting = this.meeting;
    await this.providerData.updatePendingMeeting(this.meeting); //update meeting in storage
  }

}
