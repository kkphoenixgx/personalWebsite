export interface ITitlesResponse {
  response : Array< IObjectResponse | string>
}
export interface IObjectResponse {
  title : string,
  path : string,
  response : Array< IObjectResponse | string>
}