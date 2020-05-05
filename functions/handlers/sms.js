const functions = require( 'firebase-functions' );
const admin = require( 'firebase-admin' );
admin.initializeApp();


const twilio = require( 'twilio' );
const accountSid = 'ACa55f8f0b4593fa1e0433f3691a8d318f';
const authToken = '00f5336c8d04a1c12b3da4d6521be7f8';

const twilioNumber = '+12244429606';

const client = new twilio( accountSid, authToken );
const cors = require( 'cors' )( {
  origin: true
} );
