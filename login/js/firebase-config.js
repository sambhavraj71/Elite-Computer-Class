// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZV8cacx2RcuGg2vhscbvZfzcBcSkyWQA",
    authDomain: "elite-computer-classes-71185.firebaseapp.com",
    projectId: "elite-computer-classes-71185",
    storageBucket: "elite-computer-classes-71185.firebasestorage.app",
    messagingSenderId: "173735983438",
    appId: "1:173735983438:web:d8a011e972f81e7b48c61f",
    measurementId: "G-PV0MSPTFHV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
