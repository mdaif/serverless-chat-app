import { createLogger } from '../utils/logger'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { ChatLogEntry, ChatLogResult, ConnectionEntry } from '../models/ChatLogEntry'
import { createDynamoDBClient } from './common'


const logger = createLogger(__filename)
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

  async createChatLogEntry(userInfo: ConnectionEntry, message: string, timestamp: string) {
    await this.docClient.put({
      TableName: chatHistoryTable,
      Item: {
          userId: userInfo.userId,
          userName: userInfo.userName,
          timestamp,
          message
      }
  }).promise()
  }
}

