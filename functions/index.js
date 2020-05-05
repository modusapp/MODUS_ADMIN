const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();
firestore.settings({
  timestampsInSnapshots: true
});


const twilio = require('twilio');
const accountSid = 'AC859a654c8a0cc6e645e00f7955a87330';
const authToken = 'd6e4528748fc96c6100376dcecaa57d4';

const twilioNumber = '+18472436448';

const client = new twilio(accountSid, authToken);
const cors = require('cors')({
  origin: true
});

const _ = require('lodash');
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBs0V331Px9uSKop8-Qcv5Om27ekq8fWik'
});

const imageHandler = require('./handlers/images');
const paymentHandler = require('./handlers/payments');

exports.sendOrderReceived = functions.firestore.document('orders/{orderId}').onCreate(async (snap, context) => {


  const order = snap.data();

  if (order.customer_phone && !order.test) {
    const phoneNumber = order.customer_phone;

    if (!validE164(phoneNumber)) {
      throw new Error('number must be E164 format!')
    }



    const textMessage = {
      body: 'Thanks for the order' + (order.customer_name ? ' ' + order.customer_name + "!" : '!'),
      to: phoneNumber, // Text to this number
      from: twilioNumber // From a valid Twilio number
    }

    try {
      const message = await client.messages.create(textMessage);
      return message
    }
    catch (err) {
      throw new Error(err)
    }
  }
})

exports.addHandlersToOrder = functions.firestore.document('orders/{orderId}').onCreate(async (snap, context) => {

  let order = snap.data();
  const orderId = snap.ref.id;
  const orderItems = order.order_items;

  const productsRequests = [];

  let prepared_by = [];
  if (order.test) {
    return null;
  }
  try {
    orderItems.forEach((item) => {
      let id = item.product_id;
      let ref = firestore.collection('products').doc(id);
      productsRequests.push(ref);
    });
    const productSnapshots = await firestore.getAll(...productsRequests);
    let categoryRequests = [];
    productSnapshots.forEach(product => {
      categoryRequests.push(firestore.collection('categories').doc(product.data().category));
    });
    const categorySnapshots = await firestore.getAll(...categoryRequests);
    categorySnapshots.forEach((category) => {
      if (category.data().prepared_by) {
        prepared_by.push(category.data().prepared_by);
      }
    })

    prepared_by = _.uniq(prepared_by);
    order.prepared_by = prepared_by;
    order.staged = true;
    console.log("Added handlers to order: " + JSON.stringify({prepared_by: prepared_by, staged: true}));
    return await snap.ref.set(order);
  } catch (err) {
    throw new Error(err);
  }

});

exports.sendOrderProcessing = functions.firestore.document('orders/{orderId}').onUpdate(async (snap, context) => {
  const order = snap.after.data();
  if (order.test) {
    return null;
  }
  if (order.customer_phone && !order.test) {
    const phoneNumber = order.customer_phone;
    if (order.processing && !order.completed) {
      if (!validE164(phoneNumber)) {
        throw new Error('number must be E164 format!')
      }
      const textMessage = {
        body: 'Hi' + (order.customer_name ? ' ' + order.customer_name + "!" : '!') + ' Your order is currently being made. We will text you when your order is complete!',
        to: phoneNumber, // Text to this number
        from: twilioNumber // From a valid Twilio number
      }
      try {
        const message = await client.messages.create(textMessage);
        return message
      }
      catch (err) {
        throw new Error(err)
      }

    } else{
      return null;
    }

  }
})

exports.sendOrderCompleted = functions.firestore.document('orders/{orderId}').onUpdate(async (snap, context) => {
  const order = snap.after.data();
  if (order.test) {
    return null;
  }
  let message;
  if (order.customer_phone && !order.test) {
    const phoneNumber = order.customer_phone;
    if (order.processing && order.completed) {
      if (!validE164(phoneNumber)) {
        throw new Error('number must be E164 format!')
      }
      switch (message.delivery_type) {
        case ('pickUp'):
          if (order.pickup_info.pickup_type === 'togo' || order.pickup_info.pickup_type === 'dineIn') {
            message = 'Your order is complete! Please go to the counter to pick it up. '
          } else {
            message = 'Your order is complete! Please park in one of the designated parking spots and a server will bring you your order.'
          }
          break;
        case ('inStore'):
          message = 'Your order is complete! Please go to the counter to pick it up. ';
          break;
        case ('delivery'):
          message = 'Your delivery order is complete! Thanks for dining with Coffeessions.';
          break;
        default: message = 'Your order is complete! Please go to the counter to pick it up.';
      }
      const textMessage = {
        body: message,
        to: phoneNumber, // Text to this number
        from: twilioNumber // From a valid Twilio number
      }
      try {
        const msg = await client.messages.create(textMessage);
        return msg
      }
      catch (err) {
        throw new Error(err)
      }

    }else{
      return null;
    }
  }
})

exports.registerUser = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    if (request.method !== "POST") {
      response.status(400).send("POST REQUEST REQUIRED");
      return 0;
    }
    const user = request.body.user;
    console.log(user);


    admin.auth().createUser({
      email: user.email,
      password: user.password,
      phoneNumber: '+1' + user.phoneNumber,
      disabled: false
      // eslint-disable-next-line promise/always-return
    }).then((userRecord) => {

      admin.auth().setCustomUserClaims(userRecord.uid, {
        employee: true
      }).then(sendResponse({
        success: true,
        user: Object.assign(user, userRecord)
      }, response));



    }).catch((authError) => {
      console.log(authError);
      return response.json({
        success: false,
        err: authError
      });
    });

    return 1;
  })


})
exports.updateUser = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    if (request.method !== "POST") {
      response.status(400).send("POST REQUEST REQUIRED");
      return 0;
    }
    const user = request.body.user;
    const uid = request.body.uid;
    console.log(user);

    admin.auth().updateUser(uid, {
      email: user.email,
      phoneNumber: '+1' + user.phoneNumber,
      disabled: false,

    }).then(function (userRecord) {

      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Conductor " + userRecord + "Creado");
      admin.auth().setCustomUserClaims(userRecord.uid, {
        employee: true
      }).then(sendResponse({
        success: true,
        user: Object.assign(user, userRecord)
      }, response))

    }).catch(function (authError) {
      console.log(authError);
      return response.json({
        success: false,
        err: authError
      })
    });

    return 1;
  })


})
exports.deleteUser = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    if (request.method !== "POST") {
      response.status(400).send("POST REQUEST REQUIRED");
      return 0;
    }
    const uid = request.body.uid;

    admin.auth().deleteUser(uid)
      .then(() => {
        // See the UserRecord reference doc for the contents of userRecord.
        return response.json({
          success: true
        });

      }).catch((authError) => {
        console.log(authError);
        return response.json({
          success: false,
          err: authError
        })
      });

    return 1;
  })


})

exports.moveCategoryIndex = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if (req.method !== "POST") {
      res.status(400).send("POST REQUEST REQUIRED");
      return 0;
    }
    const docIndex = req.body.docIndex;
    const shift = req.body.shift;

    const categoryRef = firestore.collection('categories').orderBy('index', 'asc');
    const updatedCategories = [];

    let newIndex;

    const moveDoc = (array, from, to) => {
      let f = array.splice(from, 1)[0];
      array.splice(to, 0, f);
      return array;
    }

    firestore.runTransaction((t) => {
      return t.get(categoryRef).then((snapshot) => {
        let index = 0;
        if (shift === 'up') {
          newIndex = docIndex - 1;
          snapshot.docs = moveDoc(snapshot.docs, docIndex, newIndex);
        }
        if (shift === 'down') {
          newIndex = docIndex + 1;
          snapshot.docs = moveDoc(snapshot.docs, docIndex, newIndex);
        }

        snapshot.forEach((doc) => {
          let newCategory = doc.data();
          newCategory.index = index;
          updatedCategories.push(newCategory);

          t.update(doc.ref, { index: index });
          index++;
        });
      }).catch((snapErr) => sendResponse({
        success: false,
        error: snapErr,
        type: 'snapshot'
      }, res));
    }).then((result) => sendResponse({
      success: true,
      oldIndex: docIndex,
      newIndex: newIndex
    }, res))
      .catch((transErr) => sendResponse({
        success: false,
        error: transErr,
        type: 'transaction'
      }, res));
  });
});

exports.handleCategoryDeletion = functions.firestore.document('categories/{categoryId}').onDelete((snap, context) => {
  const category = snap.data();
  const categoryIndex = category.index;
  const categoryRef = firestore.collection('categories').orderBy('index', 'asc');

  firestore.runTransaction((t) => {
    return t.get(categoryRef).then((snapshot) => {
      let index = 0;

      snapshot.forEach((doc) => {
        let newCategory = doc.data();
        newCategory.index = index;

        t.update(doc.ref, { index: index });
        index++;
      });
    })
  }).then((result) => {
    console.log('category at ', categoryIndex, ' deleted');
    return 1;
  });

})

exports.getPlaceDetails = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    const placeId = request.body.placeId;
    console.log(placeId);
    googleMapsClient.place({ placeid: placeId }, (err, data) => {
      if (err) {
        console.log(err);
        return sendResponse({ success: false, data: err }, response)
      }
      else {
        return sendResponse({ success: true, data: data.json }, response)

      }

    })
  })
})

// Images
exports.optimizeImages = functions.storage.object().onFinalize(imageHandler.handler);

// Payments
exports.createStripeCustomer = functions.https.onRequest(paymentHandler.createCustomer);
exports.getStripeCustomer = functions.https.onRequest(paymentHandler.getCustomer);
exports.updateStripeCustomer = functions.https.onRequest(paymentHandler.updateCustomer);
exports.createSquareCustomer = functions.https.onRequest(paymentHandler.createSquareCustomer);
exports.getSquareCustomer = functions.https.onRequest(paymentHandler.getSquareCustomer);
exports.updateSquareCustomer = functions.https.onRequest(paymentHandler.updateSquareCustomer);
exports.createSquarePayment = functions.https.onRequest(paymentHandler.createSquarePayment);
function validE164(num) {
  return /^\+?[1-9]\d{1,14}$/.test(num)
}

function sendResponse(body, res) {
  return res.json(body);
}
