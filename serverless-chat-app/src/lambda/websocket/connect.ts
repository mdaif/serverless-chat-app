import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { verifyToken } from '../utils'
import { JwtPayload } from '../../auth/JwtPayload'

const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Websocket connect', event)

  const connectionId = event.requestContext.connectionId
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
  } catch(err) {
    console.log('Could not authenticate request: ', err)
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
  const userId = tokenPayload.sub
  
  console.log('connection from userId: ', userId)
  const timestamp = new Date().toISOString()

  const item = {
    id: connectionId,
    userId: tokenPayload.sub,
    userName: tokenPayload.name,
    timestamp,
  }

  console.log('Storing item: ', item)

  await docClient.put({
    TableName: connectionsTable,
    Item: item
  }).promise()

  return {
    statusCode: 200,
    body: ''
  }
}
