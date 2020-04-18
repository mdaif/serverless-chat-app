import { ChatHistoryAccess } from "../dataLayer/chatHistoryAccess";
import { ChatLogResult } from "../models/ChatLogEntry";
import { APIGatewayProxyEvent } from "aws-lambda";


const chatHistoryAccess = new ChatHistoryAccess()
const DEFAULT_LIMIT = 30


export async function getAllChatHistory(event: APIGatewayProxyEvent): Promise<ChatLogResult>{
    const limit = parseLimitParameter(event) || DEFAULT_LIMIT
    const startKey = parseNextKeyParameter(event)

    const result = await chatHistoryAccess.getAllChatHistory(limit, startKey)
    return result
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
