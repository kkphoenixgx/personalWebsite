export interface ITittlesResponse {
  response : Array< IObjectResponse | string>
}
export interface IObjectResponse {
  tittle : string,
  path : string,
  response : Array< IObjectResponse | string>
}