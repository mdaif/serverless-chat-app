# serverless-chat-app

## About
A serverless-based shoutbox that lets authenticated users broadcast messages to one another. The messages are exchanged using websocket protocol.
This is the capstone project for Udacity's cloud developer nanodegree.

## Technology
### Authentication
Authentication is done via OAuth 2.0 . I used Auth0 as a provider. The authentication is done using asymmetric cryptography (private key + public certificate).

### Backend
- serverless framework to ease creating AWS lambda functions along with building all needed resources.
- AWS as infrastructure (serverless is supports many cloud providers). This includes
    * API Gateway.
    * DynamoDB.
    * Lambda functions.
    * IAM.

### Frontend
- Flask to handle OAuth2 flow.
- Vue.js to handle two-way bindings and ease frontend development.
- Axios for async http requests.
- Native Websocket JS client.

## How to run
- clone the code locally.
### Backend
- Change directory to serverless-chat-app directory.
- Deploy using the command (assuming you have an AWS user with sufficient permissions called serverless)
```
sls deploy -v --aws-profile serverless
```
- Should the deployment finishes successfully, you will see similar two lines under Endpoints:

  GET - https://{CHAT_HISTORY_API_ID}.execute-api.eu-central-1.amazonaws.com/dev/chat-history
  wss://{WS_API_ID}.execute-api.eu-central-1.amazonaws.com/dev

take a note of these values.

### Frontend
- Change directory to client directory.
- add two keys to env variables (CHAT_HISTORY_API_ID and WS_API_ID)
```
export CHAT_HISTORY_API_ID=<some value>
export WS_API_ID=<some value>
```
Run the client by issuing
```
python server.py
```
- Note: YOu can also run a containerized version of the app by running the script exec.sh
```
sh ./exec.sh 
```
But that requires docker to be installed, running as a non-sudo user and the env variables are added to the container.

- You can send messages to other connected users by entering a message and pressing enter.
- Every time a user enters a new message it will be added to the top of the shout-box.
- The history is retrieved in a reverse chronological order.


## Working images
1. Backend deployment

![alt successfuldeployment](screenshots/successful-deployment.png")

2. Login
 ![alt login](screenshots/log-in.png")

3.  Chat window
 ![alt chatwindow](screenshots/chat-window.png")

4. Two chat windows (with two authenticated users) 
  ![alt workingshoutbox](screenshots/working-shoutbox.png")
  
## Design notes
- Request validation is done within the lambdas. Body validator didn't apply to my usecase.
- I found DynamoDB to be pretty terrible for the use case. Unfortunately,
I discovered that late and I liked to stick to the course. I'd use either a managed
document store that supports retrieving all the items and sort them in reverse (seems to be impossible with DynamoDB)
or a relational database. If that's in place, I'd implement pagination.
- I support two ways to authenticate websocket requests.
    - Standard Authorization header: Websocket standard (and cli clients such as wscat) support HTTP Authorization header.
    - In-browser Javascript: That allows only to send "protocols": effectively that means the only way to do a similar thing
    to the Authorization header is to use 'Sec-WebSocket-Protocol' header and match on a slightly different delimiter ", " instead of " "
- Business logic and data access are separated from lambda functions to follow hexagonal architecture as much as possible.
- I kept getting 401 unauthorized errors whenever I tried to use a lambda authorizer (in auth0Authorizer.ts). I did the authentication within connect.ts


## Tracing
- Tracing is done via AWS' X-Ray
  ![alt chatwindow](screenshots/xray.png")

## Future work
- If the DB is switched to another one as mentioned in Design Notes section, I'd implement pagination.
- Unit and integration testing. Currently, the testing is only user testing but of course that's not robust.



