import * as functions from "firebase-functions";
import { Md5 } from 'ts-md5/dist/md5';
import firebase from 'firebase/app';


export const iWasHere = functions.https.onRequest((request, response) => {
  // Generate visitor signatue
  let signature:string = request.ip + request.headers["user-agent"]
  let hash:string = Md5.hashStr(signature).toString()

  // Store a visit
  firebase.database().ref('iWasHere/' + hash).set({
    timestamp: Math.round((new Date()).getTime() / 1000)
  });

  response.send(hash);
});
