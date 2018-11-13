import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { LogsResponse } from './logs-response';
import { LogsRequest } from './logs-request';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  public response = new BehaviorSubject(null);
  private url="http://localhost:52045/api/Logs";
  constructor(private httpClient:HttpClient) {}
  GetLogs(Id)
  {
    let logsRequest=new LogsRequest();
    logsRequest.Id=Id;
    let obs = this.httpClient.post(this.url,logsRequest,
      {
        headers: new HttpHeaders
        ({
          'content-type':'application/json'
        })
      });
    obs.subscribe((response)=>
    {
      this.response.next(response);
    });
}
}
