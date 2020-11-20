import  firebase  from 'firebase'
require("@firebase/firestore")

const firebaseConfig = {
    apiKey: "AIzaSyAVIENHZRsJrOyajiXuMhr1zhz4gZxApX4",
    authDomain: "wireless-library-a8e5a.firebaseapp.com",
    databaseURL: "https://wireless-library-a8e5a.firebaseio.com",
    projectId: "wireless-library-a8e5a",
    storageBucket: "wireless-library-a8e5a.appspot.com",
    messagingSenderId: "104891090084",
    appId: "1:104891090084:web:a62e5d63c80f4667ffd231",
    measurementId: "G-GDB95X4HRL"
  };

// Initialize Firebase
if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

  export default firebase.database();