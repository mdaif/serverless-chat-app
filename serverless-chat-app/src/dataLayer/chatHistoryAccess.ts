import { createLogger } from '../utils/logger'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { ChatLogEntry, ChatLogResult } from '../models/ChatLogEntry'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('logsAccess')
const chatHistoryTable = process.env.CHAT_HISTORY_TABLE

export class ChatHistoryAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient()) {
  }

  async getAllChatHistory(limit, startKey): Promise<ChatLogResult> {
    logger.info('Getting all chat history entries')
    logger.info('Ignoring key: %s', startKey)

    const result = await this.docClient.scan({
      TableName: chatHistoryTable,
    }).promise()

    const items = result.Items
    // Always take the last N items where N = limit
    const limitedItems = items.slice(items.length - limit, items.length)
    // sort them based on timestamp
    const sortedItems = limitedItems.sort((item1, item2) => {
      if (item1.timestamp > item2.timestamp) return 1
      else if (item1.timestamp < item2.timestamp) return -1
      else return 0
    })
    // return items in a reverse chronological order
    const reversedItems = sortedItems.reverse()
    const entries = reversedItems as ChatLogEntry[]
    const nextKey = result.LastEvaluatedKey
    return { entries, nextKey } as ChatLogResult
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
