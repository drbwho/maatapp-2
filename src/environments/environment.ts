// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyBe8vQCr_svrNqK2ZwLq9UiriZj-CJ3wHw",
    authDomain: "ca-22125.firebaseapp.com",
    projectId: "ca-22125",
    storageBucket: "ca-22125.appspot.com",
    messagingSenderId: "572032181108",
    appId: "1:572032181108:web:91bd1de0b2faae45a08221",
    measurementId: "G-NY3F251GST",
    vapidKey: "BH05POf03nAmW3rgBsDny6u8_vs_AmZD3dY9n_BLqRjs9KEYmeoEihs7FaircgRjaTYkL1guXkFBqQ-TV1uwjJU"
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
