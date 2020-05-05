
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const stripe = require('stripe')('sk_test_FvJP8zlrtAl7d0fu8TS03cM8001uGsp47v')
const _ = require('lodash');

const SquareConnect = require('square-connect');
const defaultClient = SquareConnect.ApiClient.instance;

const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = "EAAAEMYLzzbafBGl0-jrwNun2wq-3m1Dl1UMR7ybtN2htRKdtUmiGDcvPIP8XMnP" // production token for square

const customersApi = new SquareConnect.CustomersApi();
const paymentsApi = new SquareConnect.PaymentsApi();

const uuidv4 = require('uuid/v4');


if (!admin.apps.length) {
    admin.initializeApp();
}
const firestore = admin.firestore();
const fireAuth = admin.auth();
const cors = require('cors')({
    origin: true
});


module.exports = {
    createSquareCustomer: (request, response) => {
        return cors(request, response, async () => {
            if (request.method !== "POST") {
                response.status(400).send("POST REQUEST REQUIRED");
                return 0;
            }
            let userProfile = request.body.user;
            const cardToken = request.body.token;
            const uid = request.body.uid;

            console.log("Request Body: ", request.body);


            try {
                let customerBody = new SquareConnect.CreateCustomerRequest();
                customerBody.given_name = userProfile.firstName + ' ' + userProfile.lastName;
                customerBody.reference_id = uid;
                console.log("Square Customer Object: ", customerBody);

                const customer = await customersApi.createCustomer(customerBody);
                console.log('Square Customer Response:', customer);

                const customerId = customer.customer.id;

                let customerCardBody = new SquareConnect.CreateCustomerCardRequest();
                customerCardBody.card_nonce = cardToken;
                const customerCard = await customersApi.createCustomerCard(customerId, customerCardBody);
                console.log('Square Customer Card Response:', customerCard);




                userProfile.customerId = customerId;
                await firestore.collection('customer_profiles').doc(uid).update({ customerId: customerId });
                return sendResponse({
                    success: true,
                    squareResponse: customer
                }, response);

            }
            catch (err) {
                console.error(err);
                return sendErrorResponse({
                    success: false,
                    err: err.errors ? err.errors[0].detail : err
                }, response);
            }
        })
    },
    getSquareCustomer: async (request, response) => {
        return cors(request, response, async () => {
            try {
                const customerId = request.body.customerId;
                const customer = await customersApi.retrieveCustomer(customerId);
                return sendResponse({
                    success: true,
                    customer: customer.customer
                }, response);
            }
            catch (err) {
                console.error(err);
                return sendErrorResponse({
                    success: false,
                    err: err.errors ? err.errors[0].detail : err
                }, response);
            }
        })

    },
    updateSquareCustomer: async (request, response) => {
        return cors(request, response, async () => {
            if (request.method !== "POST") {
                response.status(400).send("POST REQUEST REQUIRED");
                return 0;
            }
            try {
                let userProfile = request.body.user;
                if (_.isNil(userProfile.customerId)) {
                    return sendErrorResponse({
                        success: false,
                        err: 'customerId required'
                    }, response);
                }
                const newCardToken = request.body.token;

                const customer = await customersApi.retrieveCustomer(userProfile.customerId);
                console.log('Square Customer Response:', customer);

                if (!_.isNil(customer.customer.cards)) {
                    let newCustomerCardBody = new SquareConnect.CreateCustomerCardRequest();
                    newCustomerCardBody.card_nonce = newCardToken;
                    const newCustomerCard = await customersApi.createCustomerCard(userProfile.customerId, newCustomerCardBody);
                    console.log('New Card Added:', newCustomerCard);

                    const oldCard = customer.customer.cards[0];
                    console.log('Retrieved Card from Square:', oldCard);

                    await customersApi.deleteCustomerCard(userProfile.customerId, oldCard.id);
                    console.log('Card Removed:', oldCard.id);

                }
                else {
                    let newCustomerCardBody = new SquareConnect.CreateCustomerCardRequest();
                    newCustomerCardBody.card_nonce = newCardToken;
                    const newCustomerCard = await customersApi.createCustomerCard(userProfile.customerId, newCustomerCardBody);
                    console.log('New Card Added:', newCustomerCard);

                }

                return sendResponse({
                    success: true,
                    customer: customer.customer
                }, response);

            }
            catch (err) {
                console.error(err);
                return sendErrorResponse({
                    success: false,
                    err: err.errors ? err.errors[0].detail : err
                }, response);
            }
        })
    },
    createSquarePayment: (request, response) => {
        return cors(request, response, async () => {
            if (request.method !== "POST") {
                response.status(400).send("POST REQUEST REQUIRED");
                return 0;
            }
            if (_.isNil(request.body.order)) {
                return sendErrorResponse({
                    success: false,
                    error: 'no order included'
                }, response);
            }
            const order = request.body.order;
            const userProfile = request.body.user;
            const uid = request.body.uid;
            try {
                // 1. get user email info
                const userAuthInfo = await fireAuth.getUser(uid);
                console.log('User Info', userAuthInfo.toJSON(), userProfile);
                console.log('Order: ', order);

                // 2. create payment data
                const customerId = userProfile.customerId;
                const email = userProfile.email;
                if (email === 'tester@coffeessions.com') {
                    order.test = true;
                    // 4. save order to db
                    const savedOrder = await firestore.collection('orders')
                        .doc(uuidv4())
                        .set(order);

                    console.log('Order saved to FireStore (test):', savedOrder);

                    return sendResponse({
                        success: true,
                        order: savedOrder,
                        squareResponse: savedOrder
                    }, response);
                }

                const customer = await customersApi.retrieveCustomer(customerId);
                console.log('Square Customer Response:', customer);

                const card = customer.customer.cards[0];
                console.log('Retrieved Card from Square:', card);

                const paymentRequestBody = new SquareConnect.CreatePaymentRequest();
                const paymentAmount = new SquareConnect.Money();
                paymentAmount.amount = Math.round(order.total_price * 100);
                paymentAmount.currency = 'USD';
                paymentRequestBody.amount_money = paymentAmount;
                paymentRequestBody.source_id = card.id;
                paymentRequestBody.customer_id = customerId;
                paymentRequestBody.buyer_email_address = userAuthInfo.email;
                paymentRequestBody.idempotency_key = uuidv4();
                // 3. Charge customer through square
                console.log('Payment Request:', paymentRequestBody);

                const squareOrder = await paymentsApi.createPayment(paymentRequestBody);

                console.log('Square Payment Response:', squareOrder);


                // 4. save order to db
                const savedOrder = await firestore.collection('orders')
                    .doc(squareOrder.payment.id)
                    .set(order);

                console.log('Order saved to FireStore:', savedOrder);

                return sendResponse({
                    success: true,
                    order: savedOrder,
                    squareResponse: squareOrder
                }, response);

            }
            catch (err) {
                console.error(err, order);
                return sendErrorResponse({
                    success: false,
                    err: err.errors ? err.errors[0].detail : err
                }, response);
            }


        })
    }
}

function sendResponse(body, res) {
    return res.json(body);
}
function sendErrorResponse(body, res) {
    return res.status(500).json(body);
}