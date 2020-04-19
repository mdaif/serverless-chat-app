import { JwtPayload } from "../auth/JwtPayload";
import { APIGatewayProxyEvent } from "aws-lambda";
import { createLogger } from "../utils/logger";
import { WebsocketAccess } from "../dataLayer/websocketAccess";
import { saveMessageToChatLog } from "./chatHistory";
import * as AWS from 'aws-sdk'

const logger = createLogger(__filename)
const websocketAccess = new WebsocketAccess()
const stage = process.env.STAGE
const apiId = process.env.API_ID
const region = process.env.REGION
const connectionParams = {
    apiVersion: "2018-11-29",
    endpoint: `${apiId}.execute-api.${region}.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

export async function setupSession(event: APIGatewayProxyEvent, tokenPayload: JwtPayload) {
    const userId = tokenPayload.sub
    const connectionId = event.requestContext.connectionId
    logger.info('Setting up session for userId: %s', userId)

    await websocketAccess.createConnection(connectionId, tokenPayload.sub, tokenPayload.name)
}

export async function tearDownSession(event: APIGatewayProxyEvent) {
    const connectionId = event.requestContext.connectionId
    logger.info('Tearing down session: %s', connectionId)
    await websocketAccess.deleteConnection(connectionId)
}

export async function broadcastToOthers(event: APIGatewayProxyEvent) {
    const senderConnectionId = event.requestContext.connectionId
    const userInfo = await websocketAccess.getSessionInfo(senderConnectionId)
    const message = event.body
    const timestamp = new Date().toISOString()
    logger.info('Getting all connections for connection: ', senderConnectionId)
    const allConnections = await websocketAccess.getAllConnections()
    for (const connection of allConnections) {
        const receiverConnectionId = connection.id
        await sendMessageToClient(userInfo.userName, message, timestamp, receiverConnectionId)
        await saveMessageToChatLog(userInfo, message, timestamp)
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

            await websocketAccess.deleteConnection(receiverConnectionId)
        }
    }
}



