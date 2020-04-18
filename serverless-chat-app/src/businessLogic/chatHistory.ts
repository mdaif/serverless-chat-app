import { ChatHistoryAccess } from "../dataLayer/chatHistoryAccess";


const chatHistoryAccess = new ChatHistoryAccess()

export async function getAllChatHistory(){
    return await chatHistoryAccess.getAllChatHistory()
}