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
    vapidKey: "BDkUEUZot6FaMtQkObl7CnXG4LRv4Bm7EaqyTvVfDW4vC1PYU40PGAxrLnmlQexhyew3WIlXpEAf5D-dsLZ88U4"
  });
  const messaging = firebase.messaging();