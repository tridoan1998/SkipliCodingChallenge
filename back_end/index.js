const express = require('express');
const app = express();
const cors = require('cors');
const firebase = require("firebase-admin");
const serviceKey = require("./serviceKey.json");
const sendSMS = require("./sms").sendSMS;

firebase.initializeApp({
    credential: firebase.credential.cert(serviceKey),
    databaseURL: "https://skipli-project.firebaseio.com/"
})

const db = firebase.database();
const ref = db.ref("users");
app.use(express.json());

ref.once("value", function (snapshot) {
    console.log(snapshot.val());
});

//use cors to allow cross origin resource sharing
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// handle when the users enter their phone numbers and click send
app.post('/send', function (req, res) {
    const phoneNumber = req.body.phoneNumber;
    CreateNewAccessCode(phoneNumber);
})

// handle when the users the access code that they receive via SMS
app.post('/verify', async function (req, res) {
    const { phoneNumber, accessCode } = req.body;
    const isSuccess = await ValidateAccessCode(phoneNumber, accessCode, res);
    if (isSuccess) {
        res.send({ success: true });
    } else {
        res.send({ success: false });
    }
})

// generate random 6 digit access code
function CreateNewAccessCode(phoneNumber) {
    const accessCode = Math.floor(100000 + Math.random() * 900000);
    saveToDB(phoneNumber, accessCode);
}

// validate if their access code they enter is correct
async function ValidateAccessCode(phoneNumber, accessCode) {
    const phoneNumberRef = ref.child(phoneNumber);
    return await phoneNumberRef.once("value")
        .then((snapshot) => {
            const retrievedAccessCode = snapshot.val().toString();
            if (retrievedAccessCode === accessCode) {
                phoneNumberRef.set("", () => {
                    console.log("Success");
                });
                return true;
            } else {
                return false;
            }
        })
        .catch((error) => {
            console.log(error);
        })

}

// map phone number and access code to database
function saveToDB(phoneNumber, accessCode) {
    ref.child(phoneNumber).set(accessCode)
    // send the message to user
    sendSMS(phoneNumber, accessCode);
}

//start your server on port 3001
app.listen(3001);
console.log("Server Listening on port 3001");