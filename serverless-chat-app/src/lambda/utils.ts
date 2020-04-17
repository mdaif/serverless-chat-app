import { APIGatewayProxyEvent } from "aws-lambda";
import Axios from 'axios'
import { verify } from 'jsonwebtoken'
import { JwtPayload } from "../auth/JwtPayload";
import { createLogger } from "../utils/logger";
const logger = createLogger('utils')

const jwksUrl = 'https://daif.eu.auth0.com/.well-known/jwks.json'


async function getCertificate(): Promise<string> {
    const response = await Axios.get(jwksUrl)
    let cert = response.data.keys[0]["x5c"][0]
    // This is the only way to make it work :/
    cert = '-----BEGIN CERTIFICATE-----\n' + cert + '\n-----END CERTIFICATE-----' 

    return cert
}

function getToken(authHeader: string): string {
  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

export async function verifyToken(event: APIGatewayProxyEvent): Promise<JwtPayload> {
  const authHeader = event.headers.Authorization
  if (!authHeader) {
    logger.error('No Authentication header')
    throw new Error('No authentication header')
  }

  const correctHeader = authHeader.toLowerCase().startsWith('bearer ')
  if (! correctHeader){
    logger.error('malformed header, %s', authHeader)
    throw new Error('Invalid authentication header')
  }

  const token = getToken(authHeader)
  const cert = await getCertificate()
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}
