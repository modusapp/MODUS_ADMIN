
  

#  Coffeessions Admin App

  

#  Getting Started:

  

1.  Install nodejs if you haven't already: https://nodejs.org/en/

2.  open this project in a dedicated terminal and run the following command: `npm run install:all`

3.  install angular globally if you don't already have it: `npm install -g @angular/cli`

4.  install firebase globally if you don't already have it: https://firebase.google.com/docs/cli

5.  login to the firebase account used for the firebase project: `firebase login`

  

MODUS uses Google Firebase as it's primary back end platform for both the tablet and mobile application. The following Firebase services are actively in use by MODUS:

  

-  Hosting-  When we deploy, the Angular 7 dashboard is bundled and deployed to firebase hosting, and is masked under the domain of admin.coffeessions.com.

-  Firestore- Cloud database, this serves as the primary data store for all of Modus. Contains the entire order history, all customer and employee profiles, and all products and categories

-  Cloud Functions- serverless functions (see list of cloud functions down below).

-  Authentication- Authentication for app and site. While Firestore holds the profile information of customers and employees, such as order history email favorites etc, Firebase Auth is what actually handles user login and registration. 

##  Development server

  

Run `ng serve` for a dev server. Navigate to `http://localhost:3001/`. The app will automatically reload if you change any of the source files.

  

##  Code scaffolding

  

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

  

##  Build

  

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

  

##  Deploy

  

To deploy everything, including the app and all cloud functions, run `npm run deploy:all`, which will build the angular app, then deploy the app along with the functions.

  

To just deploy the app or the functions, run `npm run deploy: app` or `npm run deploy:functions`.

  
  

##  Running unit tests

  

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).


## Overview of Admin Dashboard

The MODUS admin dashboard runs on Angular 7, and has the following functionality:

 1. View orders and mark them as either processing (in the making) or completed.
 2. View order history
 3. Track the location of customers from the mobile app who have pick up orders
 4. View, create, and edit products on the mobile and in-store tablet apps.
 5. View, create, and edit products on the mobile and in-store tablet apps.
 6. View, create, and edit product categories
 7. View, create and edit employees that have access to the admin dashboard. is an employee is marked as *admin*, they have the ability to modify products, categories, and other employees.


# Overview of Firebase Cloud Functions
While the MODUS mobile app and admin dashboard are able to take care of alot of the business logic and interact with the back end directly, there are some cases where full server functions are required for some automated tasks and business fulfillment. The following is a list of all Firebase Cloud Functions created for and used by MODUS:

1. addHandlersToOrder- triggered when a new order is created, this function iterates through all the items in an order and adds the appropriate service handlers for the order (ex. barista, bartender).
2. createSquareCustomer- HTTP request used by the mobile app to create a new customer under Square, including CC info, holds their square ID in their firestore customer profile.
3. createSquarePayment- Possibly the most important function of all, this HTTP request is used by the mobile app to submit a customer order. It first get's the square profile, including CC info, then takes the total from the front-end app (total cannot be 0), and submits it to the payment system, notifying the app when done.
4. deleteUser- used to remove an employee from the admin side, not used by the mobile app.
5. getPlaceDetails- HTTP request used by the order delivery page. It takes in a raw address query (customer address) and calls Google Places API to get information such as zip code city etc. 
6. getSquareCustomer- HTTP request to retrieve square customer, used to get user CC info on profile page. **Note: customer CC info is not store on their profile, their square user ID is stored on their profile and is then used here to retreive the info directly from Square.**
7. handleCategoryDeletion- Triggered when a category is deleted, this ensures categories are correctly ordered on the app when one is removed.
8. moveCategoryIndex- HTTP request used by the admin app to move the order of categories on the app.
9. optimizeImages- Another important function, this function is fired whenever a new product image is uploaded. This function will automatically scale and compress the image down, and enable caching on the image, in order to deliver them faster on the app. To make this work, the overall memory had to be increased in Google Cloud to 1gb, which may increase costs when it is used often.
10. registerUser- HTTP request used by the admin app to register new employees to be able to use the system.
11. sendOrderCompleted- Triggered whenever an order is marked as completed, this will use Twilio to send the customer an SMS message telling them the order is completed.
12. sendOrderProcessing- Triggered whenever an order is marked as processing, this will use Twilio to send the customer an SMS message informing them that their order is being made.
13. sendOrderReceived - Triggered whenever an order is created, this will use Twilio to send the customer and SMS message that their order has been received.
14. updateSquareCustomer- HTTP request used by the mobile app allowing users to update their credit card information.
15. updateUser- used by the admin app and the mobile app to update a user's email or password.