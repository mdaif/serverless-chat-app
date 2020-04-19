import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { verifyToken } from '../utils'
import { JwtPayload } from '../../auth/JwtPayload'
import { setupSession } from '../../businessLogic/webSockets'
import { createLogger } from '../../utils/logger'

const logger = createLogger(__filename)

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Websocket connect event: %s', event)

  let tokenPayload: JwtPayload
  let authHeader: string
  let delimiter: string

  try {
    if (event.headers.hasOwnProperty('Sec-WebSocket-Protocol')) {
      // JS WebSocket client doesn't allow custom authorization headers.
      authHeader = event.headers['Sec-WebSocket-Protocol']
      delimiter = ', '
    } else {
      authHeader = event.headers.Authorization
      delimiter = ' '
    }

    tokenPayload = await verifyToken(authHeader, delimiter)
  } catch (err) {
    console.error('Could not authenticate request: %s', err)
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        'error': err
      })
    }
  }

  await setupSession(event, tokenPayload)

  return {
    statusCode: 200,
    body: ''
  }
}
