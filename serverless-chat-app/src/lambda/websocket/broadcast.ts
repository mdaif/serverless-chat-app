import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE
const chatHistoryTable = process.env.CHAT_HISTORY_TABLE
const stage = process.env.STAGE
const apiId = process.env.API_ID
const region = process.env.REGION
const connectionParams = {
    apiVersion: "2018-11-29",
    endpoint: `${apiId}.execute-api.${region}.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Websocket connect', event)

    const senderConnectionId = event.requestContext.connectionId
    const userInfo = await getUserInfo(senderConnectionId)
    const message = event.body
    const timestamp = new Date().toISOString()
    console.log('Getting all connections for connection: ', senderConnectionId)

    const connections = await docClient.scan({
        TableName: connectionsTable
    }).promise()

    for (const connection of connections.Items) {
        const receiverConnectionId = connection.id
        await sendMessageToClient(userInfo.userName, message, timestamp, receiverConnectionId)
        await saveMessageToChatLog(userInfo, message, timestamp)
    }
    return {
        statusCode: 200,
        body: ''
    }
}

async function sendMessageToClient(userName: string, message: string, timestamp: string, receiverConnectionId: string) {
    try {
        console.log('Sending message to a connection', receiverConnectionId)
        const payload = {
            'userName': userName,
            'timestamp': timestamp,
            'message': message
        }
        await apiGateway.postToConnection({
            ConnectionId: receiverConnectionId,
            Data: JSON.stringify(payload),
        }).promise()
    } catch (e) {
        console.log('Failed to send message', JSON.stringify(e))
        if (e.statusCode === 410) {
            console.log('Stale connection')

            await docClient.delete({
                TableName: connectionsTable,
                Key: {
                    id: receiverConnectionId
                }
            }).promise()
        }
    }
}

async function getUserInfo(senderConnectionId: string) {
    console.log('Getting user info for connection ', senderConnectionId)
    const userInfo = await docClient.query({
        TableName: connectionsTable,
        KeyConditionExpression: 'id = :senderConnectionId',
        ExpressionAttributeValues: {
            ':senderConnectionId': senderConnectionId
        },
        Limit: 1
    }).promise()
    return userInfo.Items[0]
}

async function saveMessageToChatLog(userInfo, message, timestamp){
    console.log('Logging message for user ', userInfo['userId'])
    await docClient.put({
        TableName: chatHistoryTable,
        Item: {
            userId: userInfo.userId,
            userName: userInfo.userName,
            timestamp,
            message
        }
    }).promise()
}