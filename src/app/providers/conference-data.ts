import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';

import { UserData } from './user-data';
import { analyzeFileForInjectables } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class ConferenceData {
  data: any;

  JSON_FILE = 'JSON_FILE';
  API_JSONFILE_VERSION = 'http://bkk-apps.com:8080/cod-mobile/json-version';
  API_JSONFILE_URL = 'http://bkk-apps.com:8080/sites/default/files/sessions.json';

  constructor(public http: HttpClient, public user: UserData, public storage: Storage) {}

  load(): any {
    if (this.data) {
      return of(this.data);
    } else {
        // always load data from local stored file
        return from(this.storage
            .get(this.JSON_FILE))
            .pipe(map(this.processData, this));
    }
  }


  processData(data: any) {
    // just some good 'ol JS fun with objects and arrays
    // build up the data by linking speakers to sessions
    this.data = data;

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

                // speaker capacities
                speaker.capacity = data.capUsers.reduce ( (filtered: any, item: any) => {
                  if ( item.speakerId === speaker.id ) {
                    filtered.push(data.capacity.find( (s: any) => s.id === item.capacityId ));
                  }
                  return filtered;
                }, []);

                // speaker workgroups
                speaker.wg = data.wgUsers.reduce ( (filtered: any, item: any) => {
                  if ( item.speakerId === speaker.id ) {
                    filtered.push(data.wg.find( (s: any) => s.id === item.wgId ));
                  }
                  return filtered;
                }, []);

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
        if (dayIndex >= 0) {
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
      if (excludeTracks.indexOf(session.track) === -1) {
        matchesTracks = true;
      }
    // });

    // if the segment is 'favorites', but session is not a user favorite
    // then this session does not pass the segment test
    let matchesSegment = false;
    if (segment === 'favorites') {
      if (this.user.hasFavorite(session.name)) {
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
        let table = [];
        switch (taxName) {
          case 'wg':
            table = data.wgUsers;
            break;
          case 'capacity':
            table = data.capacityUsers;
            break;
        }
        if (Number(taxId)) {
          speakers = table.reduce ( (filtered: any, option: any) => {
            if (option.wgId === taxId) {
                  filtered.push( speakers.find( (s: any) => s.id === option.speakerId ))
            }
            return filtered;
          }, []);
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

  getMap() {
    return this.load().pipe(
      map((data: any) => {
        let mapdata: any;
        mapdata = [];
        let mapval: any;
        mapval = [];
        mapdata.name = data.info[0].venue;
        mapdata.lat = Number(data.info[0].lat);
        mapdata.lng = Number(data.info[0].lng);
        mapdata.center = true;
        mapval.push(mapdata);
        return mapval;
      })
    );
  }
}
