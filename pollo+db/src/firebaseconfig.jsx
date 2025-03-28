// firebaseConfig.jsx
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCRGW3Q0v9aWefBcNE09AK1FI_MdZaIS1E",
    authDomain: "dbpollos.firebaseapp.com",
    projectId: "dbpollos",
    storageBucket: "dbpollos.firebasestorage.app",
    messagingSenderId: "714386779594",
    appId: "1:714386779594:web:3ef38ecb8f349f3765f333"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);

export default db;