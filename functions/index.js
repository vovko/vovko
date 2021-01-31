const { Canvas } = require('canvas');
const _ = require('lodash');

const clock = require('./clock');
const heyThere = require('./heyThere');

const functions = require("firebase-functions");
const md5 = require('md5');
const admin = require('firebase-admin');
admin.initializeApp();


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.counthashchange = functions.database.ref('iWasHere/signatures/{hash}').onWrite(
  async (change) => {
    const collectionRef = change.after.ref.parent;
    const countRef = collectionRef.parent.child('hashes_count');

    let increment;
    if (change.after.exists() && !change.before.exists()) {
      increment = 1;
    } else if (!change.after.exists() && change.before.exists()) {
      increment = -1;
    } else {
      return null;
    }

    // Return the promise from countRef.transaction() so our function
    // waits for this async event to complete before it exits.
    await countRef.transaction((current) => {
      return (current || 0) + increment;
    });
    console.log('Counter updated.');
    return null;
  });

exports.iWasHere = functions.https.onRequest((request, response) => {
  let signature = request.ip + request.headers["user-agent"]
  var hash = md5(signature);

  admin.database().ref('iWasHere/signatures/' + hash).set({
    timestamp: Math.round((new Date()).getTime() / 1000)
  });

  response.send(hash);
});

exports.heyThere = functions.https.onRequest((req, res) => {
  const canvas = new Canvas(400, 300);
  const ctx = canvas.getContext('2d');
  heyThere(ctx);
  res.set('Cache-Control', 'public, max-age=60, s-maxage=31536000');
  res.writeHead(200, {'Content-Type': 'image/png'});
  canvas.createPNGStream().pipe(res);
});
