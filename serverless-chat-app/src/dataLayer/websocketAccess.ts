import { createLogger } from "../utils/logger"
import { DocumentClient } from "aws-sdk/clients/dynamodb"
import { createDynamoDBClient } from "./common"
import { ConnectionEntry } from "../models/ChatLogEntry"

const logger = createLogger(__filename)
const connectionsTable = process.env.CONNECTIONS_TABLE

export class WebsocketAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient()) {
  }
  async createConnection(connectionId: string, userId: string, userName: string) {
    logger.info('Storing session info for userId: %s', userId)
    const timestamp = new Date().toISOString()

    const item = {
      id: connectionId,
      userId,
      userName,
      timestamp,
    }

    logger.info('Storing item: %s to DB', item)

    await this.docClient.put({
      TableName: connectionsTable,
      Item: item
    }).promise()
  }
  async deleteConnection(connectionId: string) {
    logger.info('Removing connection: %s from DB', connectionId)
    await this.docClient.delete({
      TableName: connectionsTable,
      Key: {
        id: connectionId
      }
    }).promise()
  }
  async getSessionInfo(senderConnectionId: string): Promise<ConnectionEntry> {
    const userInfo = await this.docClient.query({
      TableName: connectionsTable,
      KeyConditionExpression: 'id = :senderConnectionId',
      ExpressionAttributeValues: {
        ':senderConnectionId': senderConnectionId
      },
      Limit: 1
    }).promise()
    return userInfo.Items[0] as ConnectionEntry
  }

  async getAllConnections(): Promise<ConnectionEntry[]> {
    const allConnections = await this.docClient.scan({
      TableName: connectionsTable
    }).promise()
    return allConnections.Items as ConnectionEntry[]
  }
}
