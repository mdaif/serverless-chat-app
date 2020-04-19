import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { broadcastToOthers } from '../../businessLogic/webSockets'

const logger = createLogger(__filename)


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Websocket connect event: %s', event)
    await broadcastToOthers(event)
    return {
        statusCode: 200,
        body: ''
    }
}

