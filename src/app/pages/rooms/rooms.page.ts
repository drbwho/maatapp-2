import { ImageViewerComponent } from './../../component/image-viewer/image-viewer.component';
import { Platform, ModalController } from '@ionic/angular';
import { ConferenceData } from './../../providers/conference-data';
import { Component, OnInit } from '@angular/core';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';

@Component({
  selector: 'rooms',
  templateUrl: './rooms.page.html',
  styleUrls: ['./rooms.page.scss'],
})
export class RoomsPage implements OnInit {
  rooms: any;
  venue: any;
  lat: any;
  lng: any;

  constructor(
    public dataProvider: ConferenceData,
    private photoViewer: PhotoViewer,
    private plt: Platform,
    private modalcontroller: ModalController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.eventdates) {
          this.rooms = data.rooms;
          this.venue = data.info[0].venue;
          this.lat = data.info[0].lat;
          this.lng = data.info[0].lng;
        }
      });
  }

  async photoView (url: string, name: string) {
    const plat = this.plt.platforms();
    if (this.plt.is('mobileweb')) {
        const modal = await this.modalcontroller.create({
          component: ImageViewerComponent,
          componentProps: {
            imgSource: url,
            imgTitle: name,
            imgDescription: 'Venue Plan'
          },
          cssClass: 'modal-fullscreen',
          keyboardClose: true,
          showBackdrop: true
        });
        await modal.present();
    } else {
      this.photoViewer.show(url, name);
    }
  }
}
