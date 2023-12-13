//Matrix.org tests..
/*import * as sdk from "matrix-js-sdk";
import { EmittedEvents } from 'matrix-js-sdk';
//import * as Olm from '@matrix-org/olm';
global.Olm = require('@matrix-org/olm');


@Injectable({
    providedIn: 'root'
  })
  
  export class ChatService {
    // Matrix tests...
    const client = sdk.createClient({ baseUrl: "https://matrix.org" });
    //client.publicRooms().then(data=> {
    //    console.log("Public Rooms: %s", JSON.stringify(data));
    //});
    client.loginWithPassword('drbwho', '71842417a!').then(async data=>{
      console.log('Login:', data);
      client.setAccessToken(data.access_token);
      //client.setDeviceVerified(data.user_id, data.device_id);
      client.deviceId = data.device_id;
      await client.initCrypto();
      //await client.startClient({ initialSyncLimit: 10 });

      /*client.once("sync" as EmittedEvents, (state, prevState, res)=> {
        if (state === "PREPARED") {
            console.log("prepared");
        } else {
            console.log(state);
            process.exit(1);
        }
      });*/

     /* client.on("Room.timeline" as EmittedEvents, (event, room, toStartOfTimeline)=> {
        if (event.getType() !== "m.room.message") {
            return; // only use messages
        }
        console.log('Room msg', event.event.content.body);
      });
      const content:sdk.IContent = {
        body: "message text",
        msgtype: "m.text",
      };
      client.sendEvent("!xexSQAwQJntAxqfkYw:matrix.org", "m.room.message", content).then(data=>{
        console.log(data);
      });
    });

  } */