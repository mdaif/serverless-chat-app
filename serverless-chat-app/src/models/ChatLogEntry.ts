import { DocumentClient } from 'aws-sdk/clients/dynamodb'


export interface ChatLogEntry {
    userId: string
    userName: string
    timestamp: string
    message: string
}

export interface ChatLogResult {
    entries: ChatLogEntry[]
    nextKey: DocumentClient.Key
}

export interface ConnectionEntry {
    id: string,
    userId: string,
    userName: string,
    timestamp: string,
}
