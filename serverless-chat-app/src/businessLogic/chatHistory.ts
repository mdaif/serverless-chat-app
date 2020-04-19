import { ChatHistoryAccess } from "../dataLayer/chatHistoryAccess";
import { ChatLogResult } from "../models/ChatLogEntry";
import { APIGatewayProxyEvent } from "aws-lambda";
import { createLogger } from "../utils/logger";

const logger = createLogger(__filename)
const chatHistoryAccess = new ChatHistoryAccess()
const DEFAULT_LIMIT = 30


export async function getAllChatHistory(event: APIGatewayProxyEvent): Promise<ChatLogResult>{
    const limit = parseLimitParameter(event) || DEFAULT_LIMIT

    // start key shouldn't will be ignored in this codebase. 
    // DynamoDB doesn't support a query without a partition key, which means I cannot retrieve
    // all chat logs since epoch, cannot sort them and limit them the way I can do with
    // a relational DB. Future work: get rid of DyanmoDB and use a relational one.
    const startKey = parseNextKeyParameter(event)
    logger.info('Getting All chat history with limit: %s and start key: %s', limit, startKey)
    const result = await chatHistoryAccess.getAllChatHistory(limit, startKey)
    return result
}

export async function saveMessageToChatLog(userInfo, message, timestamp){
    console.log('Logging message for user ', userInfo['userId'])
    await chatHistoryAccess.createChatLogEntry(userInfo, message, timestamp)
    
}

function parseNextKeyParameter(event: APIGatewayProxyEvent) {
    const nextKeyStr = getQueryParameter(event, 'nextKey')
    if (! nextKeyStr) {
        return undefined
    }
    const uriDecoded = decodeURIComponent(nextKeyStr)
    return JSON.parse(uriDecoded)

}

function parseLimitParameter(event: APIGatewayProxyEvent) {
    const limitStr = getQueryParameter(event, 'limit')
    if (! limitStr) {
        return undefined
    }
    const limit = parseInt(limitStr, 10)
    if (limit <= 0) {
        throw new Error('Limit must be positive')
    }
    return limit
}


function getQueryParameter(event: APIGatewayProxyEvent, name: string) {
    const queryParams = event.queryStringParameters
    if (!queryParams) {
      return undefined
    }
  
    return queryParams[name]
  }
