import { ConfigData } from './config-data';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';

import { Router } from '@angular/router';
import { UserData } from './user-data';
import { Events } from './events';

interface MyRatings {
  sessionid: string;
  uid: string;
  rate: number;
  synced: boolean;
}

interface MyReviews {
  sessionid: string;
  uid: string;
  username: string;
  text: string;
  synced: boolean;
}


@Injectable({
  providedIn: 'root'
})

export class ConferenceData {
  data: any;
  sessionratings: any;
  mysessionratings: MyRatings[];

  constructor(
    public http: HttpClient,
    public user: UserData,
    public storage: Storage,
    public alertController: AlertController,
    public router: Router,
    public events: Events,
    public config: ConfigData
  ) {}

  load(): any {
    if (this.data) {
      return of(this.data);
    } else {
        // always load data from local stored file
        return from(this.storage
            .get(this.config.JSON_FILE))
            .pipe(map(this.processData, this));
    }
  }


  processData(data: any) {
    // just some good 'ol JS fun with objects and arrays
    // build up the data by linking speakers to sessions
    this.data = data;

    // loop throug each person
    this.data.people.forEach( (person: any) => {
      // speaker capacities
      person.capacity = data.capUsers.reduce ( (filtered: any, item: any) => {
        if ( item.speakerId === person.id ) {
          filtered.push(data.capacity.find( (s: any) => s.id === item.capacityId ));
        }
      return filtered;
      }, []);

      // speaker workgroups
      person.wg = data.wgUsers.reduce ( (filtered: any, item: any) => {
        if ( item.speakerId === person.id ) {
          filtered.push(data.wg.find( (s: any) => s.id === item.wgId ));
        }
        return filtered;
      }, []);

      person.sessions = [];
    });

    // loop through each day in the schedule
    this.data.eventdates.forEach((day: any) => {
      // loop through each timeline group in the day
      day.sessions = [];
      data.programs.forEach((session: any) => {
        // loop through each session in the timeline group
        if (session.date === day.date) {
          // get speakers
          session.speakers = [];
          // speaker sessions
          data.sessionSpeakers.forEach((sessionSpeaker: any) => {
            if (sessionSpeaker.sessionId === session.id) {
              const speaker = this.data.people.find(
                (s: any) => s.id === sessionSpeaker.speakerId
              );
              if (speaker) {
                session.speakers.push(speaker);
                speaker.sessions = speaker.sessions || [];
                speaker.sessions.push(session);
              }
            }
          });

          // get track
          if (session.track != null) {
              const track = this.data.tracks.find(
                (s: any) => s.id === session.track
              );
              if (track) {
                session.trackTitle = track.title;
                session.trackChair = track.chair;
              }
          }
          // get room
          if (session.room != null) {
            const room = this.data.rooms.find(
              (s: any) => s.id === session.room
            );
            if (room) {
              session.roomName = room.name;
            }
        }
          day.sessions.push(session);
        }
      });
    });

    return this.data;
  }

  getTimeline(
    dayIndex: number,
    trackIndex: number,
    roomIndex: number,
    queryText = '',
    excludeTracks: any[] = [],
    segment = 'all'
  ) {
    return this.load().pipe(
      map((data: any) => {
        const result = {
          shownSessions: 0,
          sessions: []
        };

        queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
        const queryWords = queryText.split(' ').filter(w => !!w.trim().length);

        // limit to one day
        if (dayIndex >= 0 && segment !== 'favorites') {
          result.sessions = data.eventdates[dayIndex].sessions;
        } else {
          data.eventdates.forEach( (day: any) => {
            result.sessions.push.apply(result.sessions, day.sessions);
          });
        }
        result.sessions.forEach((session: any) => {
            // check if this session should show or not
            this.filterSession(session, trackIndex, roomIndex, queryWords, excludeTracks, segment);

            if (!session.hide) {
              // if this session is not hidden then this group should show
              result.shownSessions++;
            }
        });

        return result;
      })
    );
  }

  filterSession(
    session: any,
    trackIndex: number,
    roomIndex: number,
    queryWords: string[],
    excludeTracks: any[],
    segment: string
  ) {
    let matchesQueryText = false;
    if (queryWords.length) {
      // of any query word is in the session name than it passes the query test
      queryWords.forEach((queryWord: string) => {
        if (session.title.toLowerCase().indexOf(queryWord) > -1) {
          matchesQueryText = true;
        }
      });
    } else {
      // if there are no query words then this session passes the query test
      matchesQueryText = true;
    }

    // if any of the sessions tracks are not in the
    // exclude tracks then this session passes the track test
    let matchesTracks = false;
    // session.tracks.forEach((trackName: string) => {
      if (excludeTracks.indexOf(session.trackTitle) === -1) {
        matchesTracks = true;
      }
    // });

    // if the segment is 'favorites', but session is not a user favorite
    // then this session does not pass the segment test
    let matchesSegment = false;
    if (segment === 'favorites') {
      if (this.user.hasFavorite(session.title)) {
        matchesSegment = true;
      }
    } else {
      matchesSegment = true;
    }

    // if limit by track
    let matchesTrack = false;
    if (trackIndex) {
      if (Number(session.track) === trackIndex ) {
        matchesTrack = true;
      }
    } else {
        matchesTrack = true;
    }

    // if limit by room
    let matchesRoom = false;
    if (roomIndex) {
      if (Number(session.room) === roomIndex ) {
        matchesRoom = true;
      }
    } else {
        matchesRoom = true;
    }

    // all tests must be true if it should not be hidden
    session.hide = !(matchesQueryText && matchesTracks && matchesSegment && matchesTrack && matchesRoom);
  }

  getSpeakers(showWhat: any, taxName: any, taxId: any) {
    return this.load().pipe(
      map((data: any) => {
        let speakers = [];

        // filter speakers or not
        switch (showWhat) {
          case 'all':
            speakers = data.people;
            break;
          case 'speakers':
            speakers = data.people.reduce ( (filtered: any, itempeople: any) => {
                if ( data.sessionSpeakers.filter( (item: any) => {
                      return item.speakerId === itempeople.id;
                      }).length > 0
                    ) {
                  filtered.push( itempeople );
                }
                return filtered;
            }, []);
        }

        // filter according to taxonomy tags
        if (Number(taxId)) {
          let table = [];
          switch (taxName) {
            case 'wg':
              table = data.wgUsers;
              speakers = table.reduce ( (filtered: any, option: any) => {
                if (option.wgId === taxId) {
                    filtered.push( speakers.find( (s: any) => s.id === option.speakerId ));
                }
                return filtered;
              }, []);
              break;
            case 'capacity':
              table = data.capUsers;
              speakers = table.reduce ( (filtered: any, option: any) => {
                if (option.capacityId === taxId) {
                    filtered.push( speakers.find( (s: any) => s.id === option.speakerId ));
                }
                return filtered;
              }, []);
              break;
          }
        }

        return speakers.sort((a: any, b: any) => {
          const aName = a.fname.split(' ').pop();
          const bName = b.lname.split(' ').pop();
          return aName.localeCompare(bName);
        });
      })
    );
  }

  getTracks() {
    return this.load().pipe(
      map((data: any) => {
        return data.tracks.sort();
      })
    );
  }

  getTaxonomy(type, taxid) {
    return this.load().pipe(
      map((data: any) => {
        if (type === 'capacity') {
          return data.capacity.filter( w => w.id === taxid);
        } else if ( type === 'wg' ) {
          return data.wg.filter( w => w.id === taxid);
        }
      })
    );
  }

  // return sessions' files
  getFiles(sessionid) {
    return this.load().pipe(
      map((data: any) => {
          return data.files.filter( w => w.sessionId === sessionid);
      })
    );
  }

  getMap(type: string) {
    return this.load().pipe(
      map((data: any) => {
        let mapdata: any;
        mapdata = [];
        let mapval: any;
        mapval = [];
        if (type === 'venue') {
          mapdata.name = data.info[0].venue;
          mapdata.lat = Number(data.info[0].lat);
          mapdata.lng = Number(data.info[0].lng);
          mapdata.center = true;
        } else if (type === 'city') {
          mapdata.name = 'City Center';
          mapdata.lat = Number(data.info[0].city_lat);
          mapdata.lng = Number(data.info[0].city_lng);
          mapdata.center = true;
        }
        mapval.push(mapdata);
        return mapval;
      })
    );
  }

  loadSessionsRatings () {
    this.storage.get(this.config.SESSION_RATINGS).then( (res) => {
      if (res === null) {
        this.sessionratings = [];
      } else {
        this.sessionratings = res;
      }
    });
  }


  loadMySessionsRatings () {
    this.storage.get(this.config.MY_SESSION_RATINGS).then( (res) => {
      if (res === null) {
        this.mysessionratings = [];
      } else {
        this.mysessionratings = res;
      }
    });
  }

  getRemoteSessionsRatings(httpclient: HttpClient) {
    const headers = new HttpHeaders();
    headers.append('Cache-control', 'no-cache');
    headers.append('Cache-control', 'no-store');
    headers.append('Expires', '0');
    headers.append('Pragma', 'no-cache');

    httpclient
    .get(this.config.API_GETRATINGS_URL, {headers})
    .subscribe( async (data: any) => {
        if (data.length > 0) {
          this.storage.remove(this.config.SESSION_RATINGS).then( () => {
            this.storage.set(this.config.SESSION_RATINGS, data);
            this.sessionratings = data;
          });
        }
    });
  }

  getSessionRatings(sessionid): Promise<number> {
    const res = this.sessionratings.filter( w => {
      return w.session_id === sessionid; } );
    return Promise.all([res]).then( tab => {
      if (tab[0].length === 0) {
        return 0;
      } else {
        return Number(tab[0][0].average) / 20;
      }
    });
  }

  // filter myratings by uid and session
  getMySessionRatings(sessionid): Promise<number> {
    const loggedin = this.user.isLoggedIn();
    const user: any = this.user.getUser();
    return Promise.all ([loggedin, user]).then ( res => {
       if (res[0]) {
        const tab = this.mysessionratings.filter( w => (w.uid === res[1].uid && w.sessionid === sessionid) );
        if (tab.length === 0) {
          return 0;
        } else {
          return tab[0].rate;
        }
      } else {
        return 0;
      }
    });
  }

  // store my ratings
  async putSessionRating(sessionid, rate: number) {
    if (await this.user.isLoggedIn()) {
      // manage session rating
      const user: any = await this.user.getUser();
      const myrats = this.mysessionratings.filter( w => (w.uid === user.uid && w.sessionid === sessionid) );
      if (myrats.length === 0) {
        this.mysessionratings.push( {
            sessionid: sessionid,
            uid: user.uid,
            rate: rate,
            synced: false
        });
      } else {
        myrats[0].rate = rate;
        myrats[0].synced = false;
      }
      this.storage.set(this.config.MY_SESSION_RATINGS, this.mysessionratings);

      // manage session review
      const alert = await this.alertController.create({
          header: 'Review!',
          message: 'Please enter your review',
          inputs: [
            {
              name: 'text',
              type: 'text',
              placeholder: 'Review'
            }
          ],
          buttons: [
            {
              text: 'Submit',
              handler: (data) => {
                console.log('Review text:' + data.text);
                this.storage.get(this.config.MY_SESSION_REVIEWS).then( (revs: MyReviews[]) => {
                  if (revs === null) {
                    revs = [];
                  }
                  revs.push({
                    sessionid: sessionid,
                    uid: user.uid,
                    username: user.username,
                    text: data.text,
                    synced: false
                  });
                this.storage.set(this.config.MY_SESSION_REVIEWS, revs);
                });
              }
            }
          ]
        });
        await alert.present();
    } else {
        this.router.navigateByUrl('/login');
      }
  }

  // sync myratings and myreviews with server
  async postSessionRatings(http: HttpClient) {
      // post ratings
      this.mysessionratings.forEach(element => {
        if ( !element.synced ) {
          const url = this.config.API_SETRATING_URL + '?user_id=' + element.uid + '&fivestar_value='
                      + element.rate + '&session_id=' + element.sessionid;
          this.http.get(url).subscribe( async res => {
            if (res) {
              element.synced = true;
              this.storage.set(this.config.MY_SESSION_RATINGS, this.mysessionratings);
            }
          });
        }
      });

      // post reviews
      this.storage.get(this.config.MY_SESSION_REVIEWS).then (reviews => {
        if (reviews) {
          if ( reviews.length > 0 ) {
            reviews.forEach(element => {
              if (!element.synced) {
                const url = this.config.API_SETREVIEWS_URL + '?user_id=' + element.uid + '&comment_body=' + element.text
                      + '&user_name=' + element.username + '&session_id=' + element.sessionid;
                this.http.get(url).subscribe( async res => {
                  if (res) {
                    element.synced = true;
                    this.storage.set(this.config.MY_SESSION_REVIEWS, reviews);
                  }
                });
              }
            });
          }
        }
      });
  }

}
