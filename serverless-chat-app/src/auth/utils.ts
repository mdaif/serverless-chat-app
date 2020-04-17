// import { decode } from 'jsonwebtoken'

// import { JwtPayload } from './JwtPayload'
// import { APIGatewayProxyEvent } from 'aws-lambda'


// function parseJwtToken(jwtToken: string): JwtPayload {
//   const decodedJwt = decode(jwtToken) as JwtPayload
//   return decodedJwt
// }


// /**
//  * Get a JWT token from an API Gateway event
//  * @param event an event from API Gateway
//  *
//  * @returns a JWT token
//  */
// export function getJwtToken(event: APIGatewayProxyEvent): JwtPayload {
//   const authHeader = event.headers.Authorization
  
//   const split = authHeader.split(' ')
//   const jwtToken = split[1]

//   return parseJwtToken(jwtToken)
// }
