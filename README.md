# serverless-chat-app

## About
A serverless-based shoutbox that lets authenticated users broadcast messages to one another. The messages are exchanged using websocket protocol.

## Technology
### Authentication
Authentication is done via OAuth2. I used Auth0 as a provider. The authentication is done using asymmetric cryptography (private key + public certificate).

### Backend
- serverless framework to ease creating AWS lambda functions along with building all needed resources.
- AWS as infrastructure (serverless is supports many cloud providers). This includes
-- API Gateway.
-- DynamoDB.
-- Lambda functions.
-- IAM.

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
- Should the deployment finishes successfully, you will see similar two lines under Endpoints
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





