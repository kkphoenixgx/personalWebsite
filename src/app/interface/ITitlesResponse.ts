export interface IPagesResponse {
  response : Array< IPage >
}
export interface IPage {
  title : string,
  path : string,
  items : Array< IPage >
}