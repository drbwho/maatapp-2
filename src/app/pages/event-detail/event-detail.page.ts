import { ConferenceData } from './../../providers/conference-data';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'event-detail',
  templateUrl: './event-detail.page.html',
  styleUrls: ['./event-detail.page.scss'],
})
export class EventDetailPage implements AfterViewInit {
  defaultHref = '';
  event = {
    title: '',
    description: '',
    date: '',
    lat: '',
    lng: ''
  };

  constructor(private route: ActivatedRoute, public dataProvider: ConferenceData) { }
  @ViewChild('mapCanvas', { static: true }) mapElement: ElementRef = <any>ElementRef;
  maptitle: string = "";


  ionViewWillEnter() {
    this.defaultHref = `/app/tabs/events`;
  }

  getEvent(title: string) {
    this.dataProvider.load().subscribe( (data: any) => {
      if (data && data.socialevents) {
          this.event = data.socialevents.find( d => d.title === title );
        }
      });
  }

  async ngAfterViewInit() {
    const eventTitle = this.route.snapshot.paramMap.get('eventTitle');
    this.getEvent(eventTitle);

    const mapEle = this.mapElement.nativeElement;
    const googleMaps = await getGoogleMaps(
      'AIzaSyB7pYPQaEe3TSN2bkEpXQhXb8Km-TVNX0c'
    );

    let mapdata: any;
    mapdata = [];
    let mapData: any;
    mapData = [];
    mapdata.name = this.event.title;
    mapdata.lat = Number(this.event.lat);
    mapdata.lng = Number(this.event.lng);
    mapdata.center = true;
    mapData.push(mapdata);

    const map = new googleMaps.Map(mapEle, {
      center: mapData.find((d: any) => d.center),
      zoom: 10
    });

    mapData.forEach((markerData: any) => {
      const infoWindow = new googleMaps.InfoWindow({
        content: `<h5>${markerData.name}</h5>`
      });

      const marker = new googleMaps.Marker({
        position: markerData,
        map,
        title: markerData.name
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });

    googleMaps.event.addListenerOnce(map, 'idle', () => {
      mapEle.classList.add('show-map');
    });

    // Create the nav to app button
    const navControlDiv = document.createElement('div');
    const navControl = createNavControl(map, mapdata.lat, mapdata.lng);
    navControlDiv.appendChild(navControl);
    map.controls[googleMaps.ControlPosition.BOTTOM_CENTER].push(navControlDiv); 
    
  }
}

function getGoogleMaps(apiKey: string): Promise<any> {
  const win = window as any;
  const googleModule = win.google;
  if (googleModule && googleModule.maps) {
    return Promise.resolve(googleModule.maps);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      const googleModule2 = win.google;
      if (googleModule2 && googleModule2.maps) {
        resolve(googleModule2.maps);
      } else {
        reject('google maps not available');
      }
    };
  });
}

function createNavControl(map, lat: Number, lng: Number) {
  const navButton = document.createElement('button');

  // Set CSS for the control.
  navButton.style.backgroundColor = '#fff';
  navButton.style.border = '2px solid #fff';
  navButton.style.borderRadius = '3px';
  navButton.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  navButton.style.color = 'rgb(25,25,25)';
  navButton.style.cursor = 'pointer';
  navButton.style.fontFamily = 'Roboto,Arial,sans-serif';
  navButton.style.fontSize = '12px';
  navButton.style.lineHeight = '32px';
  navButton.style.margin = '8px 0 22px';
  navButton.style.padding = '0 3px';
  navButton.style.textAlign = 'center';

  navButton.textContent = 'Open in Google Maps';
  navButton.title = 'Click to open in Maps App';
  navButton.type = 'button';

  // Setup the click event listeners: simply set the map to Chicago.
  navButton.addEventListener('click', () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`);
  });

  return navButton;
}
