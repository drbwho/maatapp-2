import { Component, OnInit } from '@angular/core';
import { Events } from '../../providers/events';
import { AppComponent } from '../../app.component';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { DataProvider } from '../../providers/provider-data';

@Component({
    selector: 'app-status-icons',
    templateUrl: './status-icons.component.html',
    styleUrls: ['./status-icons.component.scss'],
    standalone: false
})
export class StatusIconsComponent  implements OnInit {
  network_status = false;
  upload_status = false;

  constructor(
    private events: Events,
    private appcomponent: AppComponent,
    private storage: Storage,
    private config: ConfigData,
    private dataProvider: DataProvider
  ) { }

  async ngOnInit() {
    // Set status on init
    this.network_status = this.dataProvider.networkStatus;
    this.upload_status = await this.check_upload_status();

    // Subscribe to changing events
    this.events.subscribe('network:connect', () => {
      this.network_status = true;
    });
    this.events.subscribe('network:disconnect', () => {
      this.network_status = false;
    });
    this.events.subscribe('upload:updated', async () => {
      this.upload_status = await this.check_upload_status();
    });

  }

  async check_upload_status (){
    var res = await this.storage.get(this.config.TRANSACTIONS_FILE);
    var newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
    if((res && res.length) || newmeetings && newmeetings.length){
      return true;
    }
    return false;
  }

}
