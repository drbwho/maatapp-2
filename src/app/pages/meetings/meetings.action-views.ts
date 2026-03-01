import { Injectable, ɵDEFAULT_LOCALE_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataProvider, Meeting } from '../../providers/provider-data';
import { ActionViewComponent } from '../../component/action-view/action-view.component';
import { ModalController } from '@ionic/angular';
import { OperationTools } from '../../providers/operation-tools';
import { formatDate } from '@angular/common';

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
          meeting.endedat = formatDate(new Date(), 'Y-MM-dd', ɵDEFAULT_LOCALE_ID);
          resolve(true);
        }
      })
    })
  }


  show_action_upload_success(meeting: any){
    return new Promise((resolve)=>{
      if(!meeting){
        resolve(false);
        return;
      }
      let keys = ['messages.meetings.upload-success.heading', 'messages.meetings.upload-success.description',
        'messages.meetings.upload-success.button', 'messages.meetings.upload-success.button_1',
        'data_uploaded','success','error'];

      this.translate.get(keys).subscribe(async (keys)=>{
        let buttons = [];
        if(!meeting.endedat){
          buttons.push({text: keys['messages.meetings.upload-success.button'], color: 'primary', action:'close'});
        }
        buttons.push({text: keys['messages.meetings.upload-success.button_1'], color: 'light', action:'history'});

        const modal = await this.modalCtrl.create({
          component: ActionViewComponent,
          componentProps: {
            alttitle: meeting.place,
            heading: keys['messages.meetings.upload-success.heading'],
            description: keys['messages.meetings.upload-success.description'],
            image: 'assets/img/action-views/upload-success-meeting.png',
            hasBackButton: true,
            buttons: buttons
          },
          cssClass: ''
        });
        await modal.present();
        await modal.onWillDismiss().then(async (data: any)=>{
          if(data.data =='close'){
            resolve(await this.close_meeting(meeting)); 
          }
          if(data.data =='history'){
            resolve('history');  
          }
        });
      });
    });
  }

  show_action_upload_failed(meeting: any){
    return new Promise((resolve)=>{
      if(!meeting){
        resolve(false);
        return;
      }
      let keys = ['messages.meetings.upload-failed.heading', 'messages.meetings.upload-failed.description',
        'messages.meetings.upload-failed.button', 'messages.meetings.upload-failed.button_1',
        'data_uploaded','success','error'];

      this.translate.get(keys).subscribe(async (keys)=>{
        const modal = await this.modalCtrl.create({
          component: ActionViewComponent,
          componentProps: {
            alttitle: meeting.place,
            heading: keys['messages.meetings.upload-failed.heading'],
            description: keys['messages.meetings.upload-failed.description'],
            image: 'assets/img/action-views/upload-success-meeting.png',
            hasBackButton: true,
            buttons: [
              {text: keys['messages.meetings.upload-failed.button'], color: 'primary', action:'tryagain'},
              {text: keys['messages.meetings.upload-failed.button_1'], color: 'light', action:'continue'}
            ]
          },
          cssClass: ''
        });
        await modal.present();
        await modal.onWillDismiss().then(async (data: any)=>{
          resolve(data.data);
        });
      });
    });
  }

  show_action_cancel(meeting: any){
    return new Promise((resolve)=>{
      if(!meeting){
        resolve(false);
        return;
      }
      let keys = ['messages.meetings.cancel.heading', 'messages.meetings.cancel.description',
        'messages.meetings.cancel.button', 'messages.meetings.cancel.button_1',
        'success','error'];

      this.translate.get(keys).subscribe(async (keys)=>{
        const modal = await this.modalCtrl.create({
          component: ActionViewComponent,
          componentProps: {
            alttitle: meeting.place,
            heading: keys['messages.meetings.cancel.heading'],
            description: keys['messages.meetings.cancel.description'],
            image: 'assets/img/action-views/cancel-meeting.png',
            hasBackButton: true,
            buttons: [
              {text: keys['messages.meetings.cancel.button'], color: 'primary', action:'cancel'},
              {text: keys['messages.meetings.cancel.button_1'], color: 'light', action:'keep'}
            ]
          },
          cssClass: ''
        });
        await modal.present();
        await modal.onWillDismiss().then(async (data: any)=>{
          if(data.data == 'cancel'){
            // clear transactions
            this.operationTools.clearPendingOperations(meeting).then((res)=>{
              if(res){
                // clear meeting
                this.operationTools.clearPendingOperations(meeting, true).then((res)=>{
                  resolve(res);
                })
              }else{
                resolve(false);
              }
            })
          }else{
            resolve(false);
          }
        });
      });
    });    
  }
}
