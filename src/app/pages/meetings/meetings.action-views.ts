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
    return new Promise(async (resolve)=>{
      if(!meeting){
        resolve(false);
        return;
      }
 
      const modal = await this.modalCtrl.create({
        component: ActionViewComponent,
        componentProps: {
          alttitle: meeting.place,
          heading: 'messages.meetings.upload-close.heading',
          description: 'messages.meetings.upload-close.description',
          image: 'assets/img/action-views/upload-close-meeting.png',
          hasBackButton: true,
          buttons: [
            {text: 'messages.meetings.upload-close.button', color: 'primary', action:'upload'},
            {text: 'messages.meetings.upload-close.button_1', color: 'light', action:'close'},
          ]
        },
        cssClass: ''
      });
      await modal.present();
      await modal.onWillDismiss().then(async (data: any)=>{
        if(data.data =='upload'){
          resolve({success: await this.upload_meeting(meeting), action: 'upload'}); 
        }
        if(data.data =='close'){
          resolve({success: await this.close_meeting(meeting), action: 'close'});  
        }
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
    return new Promise(async (resolve)=>{
      if(!meeting){
        resolve(false);
        return;
      }

      let buttons = [];
      if(!meeting.endedat){
        buttons.push({text: 'messages.meetings.upload-success.button', color: 'primary', action:'close'});
      }
      buttons.push({text: 'messages.meetings.upload-success.button_1', color: 'light', action:'history'});

      const modal = await this.modalCtrl.create({
        component: ActionViewComponent,
        componentProps: {
          alttitle: meeting.place,
          heading: 'messages.meetings.upload-success.heading',
          description: 'messages.meetings.upload-success.description',
          image: 'assets/img/action-views/upload-success-meeting.png',
          hasBackButton: true,
          buttons: buttons
        },
        cssClass: ''
      });
      await modal.present();
      await modal.onWillDismiss().then(async (data: any)=>{
        if(data.data =='close'){
          resolve({success: await this.close_meeting(meeting), action: 'close'}); 
        }
        if(data.data =='history'){
          resolve({action: 'history'});  
        }
      });
    });
  }

  show_action_upload_failed(meeting: any){
    return new Promise(async (resolve)=>{
      if(!meeting){
        resolve(false);
        return;
      }
      const modal = await this.modalCtrl.create({
        component: ActionViewComponent,
        componentProps: {
          alttitle: meeting.place,
          heading: 'messages.meetings.upload-failed.heading',
          description: 'messages.meetings.upload-failed.description',
          image: 'assets/img/action-views/upload-success-meeting.png',
          hasBackButton: true,
          buttons: [
            {text: 'messages.meetings.upload-failed.button', color: 'primary', action:'tryagain'},
            {text: 'messages.meetings.upload-failed.button_1', color: 'light', action:'continue'}
          ]
        },
        cssClass: ''
      });
      await modal.present();
      await modal.onWillDismiss().then(async (data: any)=>{
        resolve({action: data.data});
      });
    });
  }

  show_action_cancel(meeting: any){
    return new Promise(async (resolve)=>{
      if(!meeting){
        resolve(false);
        return;
      }
      const modal = await this.modalCtrl.create({
        component: ActionViewComponent,
        componentProps: {
          alttitle: meeting.place,
          heading: 'messages.meetings.cancel.heading',
          description: 'messages.meetings.cancel.description',
          image: 'assets/img/action-views/cancel-meeting.png',
          hasBackButton: true,
          buttons: [
            {text: 'messages.meetings.cancel.button', color: 'primary', action:'cancel'},
            {text: 'messages.meetings.cancel.button_1', color: 'light', action:'keep'}
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
                resolve({success: res});
              })
            }else{
              resolve({success: false});
            }
          })
        }else{
          resolve({success: false});
        }
      });
    });   
  }
}
