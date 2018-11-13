import { Log } from "./log";

export class LogsResponse
{
    Response:Response;
    LogCount:number;
    Time:string;
    Logs:Array<Log>;
}
class Response
{
    Message:string;
    Status:string;
    StatusCode:number;
}