importScripts(
    "https://www.gstatic.com/firebasejs/9.7.0/firebase-app-compat.js",
  );
  importScripts(
    "https://www.gstatic.com/firebasejs/9.7.0/firebase-messaging-compat.js",
  );
  
  firebase.initializeApp({
    apiKey: "AIzaSyBe8vQCr_svrNqK2ZwLq9UiriZj-CJ3wHw",
    authDomain: "ca-22125.firebaseapp.com",
    projectId: "ca-22125",
    storageBucket: "ca-22125.appspot.com",
    messagingSenderId: "572032181108",
    appId: "1:572032181108:web:91bd1de0b2faae45a08221",
    measurementId: "G-NY3F251GST",
    vapidKey: "BH05POf03nAmW3rgBsDny6u8_vs_AmZD3dY9n_BLqRjs9KEYmeoEihs7FaircgRjaTYkL1guXkFBqQ-TV1uwjJU"
  });
  const messaging = firebase.messaging();