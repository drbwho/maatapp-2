import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataProvider, Meeting } from '../../providers/provider-data';
import { ActionViewComponent } from '../../component/action-view/action-view.component';
import { ModalController } from '@ionic/angular';
import { OperationTools } from '../../providers/operation-tools';

@Injectable({
  providedIn: 'root',
})
export class MeetingsActionViews {
  
  constructor(
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private dataProvider: DataProvider,
    private operationTools: OperationTools
  ){

  }

  /*
  * Upload or Close meeting View
  *
  */
  show_action_upload_close(meeting: any){
    return new Promise((resolve)=>{
      if(!meeting){
        resolve(false);
        return;
      }
      let keys = ['messages.meetings.upload-close.heading', 'messages.meetings.upload-close.description',
        'messages.meetings.upload-close.button', 'messages.meetings.upload-close.button_1',
        'data_uploaded','success','error'];

      this.translate.get(keys).subscribe(async (keys)=>{
        const modal = await this.modalCtrl.create({
          component: ActionViewComponent,
          componentProps: {
            alttitle: meeting.place,
            heading: keys['messages.meetings.upload-close.heading'],
            description: keys['messages.meetings.upload-close.description'],
            image: 'assets/img/action-views/upload-close-meeting.png',
            hasBackButton: true,
            buttons: [
              {text: keys['messages.meetings.upload-close.button'], color: 'primary', action:'upload'},
              {text: keys['messages.meetings.upload-close.button_1'], color: 'light', action:'close'},
            ]
          },
          cssClass: ''
        });
        await modal.present();
        await modal.onWillDismiss().then(async (data: any)=>{
          if(data.data =='upload'){
            resolve(await this.upload_meeting(meeting)); 
          }
          if(data.data =='close'){
            resolve(await this.close_meeting(meeting));  
          }
        });
      });
    });
  }

  upload_meeting(meeting: any){
    return new Promise((resolve)=>{
      this.operationTools.uploadOperations(meeting).then(async (res:any) => {
        if(res.status.toLowerCase() == 'error'){
          resolve(false);
        }else{
          resolve(true);
        }
      });
    });
  }

  close_meeting(meeting: any){
    return new Promise((resolve)=>{
      this.dataProvider.closeMeeting(meeting).then(async (res: any)=>{
        if(res.status != undefined && res.status == 'error'){
          resolve(false);
        }else{
          resolve(true);
        }
      })
    })
  }


  show_action_upload_success(meeting: any){

  }
}
