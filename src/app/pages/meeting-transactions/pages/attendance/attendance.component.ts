import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
  standalone: false
})
export class AttendanceComponent  implements OnInit {
  @Input() group: any;
  @Input() accounts: any;
  numberofmembers = 0;
  attendance = 0;

  constructor() { }

  ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
  }

  togglePresence(account: any) {
    account.isPresent = !account.isPresent;
    this.calcAttendance();
  }

  calcAttendance(){
    this.attendance = this.accounts?.filter(m => m.isPresent).length;
  }

}
