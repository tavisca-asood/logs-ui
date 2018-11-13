import { Component, OnInit } from '@angular/core';
import { LogsService } from '../logs.service';
import { LogsResponse } from '../logs-response';
import { NgxSpinnerService } from 'ngx-spinner';
import { from } from 'rxjs';
import { groupBy, mergeMap, toArray } from 'rxjs/operators';
import { Log } from '../log';
declare var CanvasJS: any;


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  logsResponse: LogsResponse;
  logs: Log[];
  sortedLogs: any;
  dataPoints: any;
  stripLinesNumber: number[];

  constructor(private logsService: LogsService, private spinner: NgxSpinnerService) {
    this.sortedLogs = [];
    this.dataPoints = [];
    this.stripLinesNumber = [];
    this.logs = [];
  }

  ngOnInit() {
    this.logsService.response.subscribe(async (response) => {
      if (response != null) {
        this.logsResponse = response;
        this.logs = response.logs;
        await this.SortLogs();
        await this.GetDataPoints(this.logs);
        this.RenderGraph(this.dataPoints);
        this.Response();
      }
    });
  }

  async SortLogs() {
    const source = from(this.logs);
    const example = source.pipe(
      groupBy(log => log.AppName),
      mergeMap(group => group.pipe(toArray()))
    );
    example.subscribe(sortedLogByAppName => {
      this.sortedLogs.push(sortedLogByAppName)
    });
  }

  GetDataPoints(logs) {
    let currentX = 0;
    let start_time = logs[logs.length - 1].fields.log_time;
    let stripLineNumberIndex = 0;
    this.stripLinesNumber.push(0);
    this.sortedLogs.forEach(LogsArray => {
      let currentApiY = 0;
      let altApiColor = true;
      let altTraceColor = true;
      let altExceptionColor = true;

      //let currentEndTime = this.GetY1(start_time, LogsArray[0].log_time) + LogsArray[0].fields.time_taken_ms;
      LogsArray.forEach(log => {
        if (log.logType == "api") {
          altApiColor = !altApiColor;
          currentX++;
          let y1 = this.GetY1(start_time, log.fields.log_time);
          let y = [y1, y1 + (log.fields.hasOwnProperty('time_taken_ms') ? log.fields.time_taken_ms : log.fields.hasOwnProperty('timeTakenMs') ? log.fields.timeTakenMs : 1)];
          this.dataPoints.push({ x: currentX, y, color: altApiColor ? "#4CAC90" : "#008080", label: " ", appName: log.appName, logId: log.logId, logType: log.logType, api: log.fields.api, verb: log.fields.verb, time_taken_ms: log.fields.time_taken_ms, LogTime: log.fields.log_time })
        }
        // else
        // {
        //   altTraceColor = !altTraceColor;
        //   if(log.logType == "trace")
        //   {
        //     let x = currentX + 2;
        //     let y1 = this.GetY1(start_time, log.fields.log_time)
        //     let y = [y1, y1+50];
        //     this.dataPoints.push({x, color: altTraceColor ?"#DF874D": "#C9D45C", label:log.appName, appName: log.appName, logId: log.logId, logType: log.logType, logTime: log.fields.log_time });
        //   }
        //   else
        //   {
        //     altExceptionColor=!altExceptionColor;
        //     if(log.logType == "exception")
        //     {
        //       let x = currentX + 1;
        //       let y1 = this.GetY1(start_time, log.fields.log_time)
        //       let y = [y1, y1+50];
        //       this.dataPoints.push({x, color: altExceptionColor ?"#DF7970": "#FF4540",label:" ", appName: log.appName, logId: log.logId, logType: log.logType, logTime: log.fields.log_time });

        //     }
        //   }
        //}
      });
      currentX++;
      this.stripLinesNumber.push(currentX);
      stripLineNumberIndex++;
      let appNameX = currentX - parseInt(((this.stripLinesNumber[stripLineNumberIndex] - this.stripLinesNumber[stripLineNumberIndex - 1]) / 2).toString());
      this.dataPoints.push({ x: appNameX, label: LogsArray[0].appName });
      this.dataPoints.push({ x: currentX, label: " " });
    });
  }
  GetY1(start_time, log_time) {
    let start_timeMin = start_time.substring(14, 16);
    let log_timeMin = log_time.substring(14, 16);
    let start_timeSeconds = start_time.substring(17, 26);
    let log_Seconds = log_time.substring(17, 26);
    let start_hours = start_time.substring(11, 13);
    let log_hours = log_time.substring(11, 13);
    let diff = (parseFloat(log_hours) - parseFloat(start_hours)) * 3600 + (parseFloat(log_timeMin) - parseFloat(start_timeMin)) * 60 + parseFloat(log_Seconds) - parseFloat(start_timeSeconds);
    return diff * 1000;
  }
  GetStripLines() {
    let stripLines = [];
    for (let i = 0; i < this.sortedLogs.length; i++) {
      stripLines.push({ value: this.stripLinesNumber[i], color: "dimgrey", thickness: 2 });
    }
    return stripLines;
  }
  RenderGraph(dataPoints) {
    let chart = new CanvasJS.Chart("chartContainer",
      {
        //backgroundColor: "#F5DEB3",
        theme: "dark2",
        dataPointMaxWidth: 10,
        zoomEnabled: true,
        zoomType: "xy",
        axisY: {
          includeZero: false,
          crosshair: {
            enabled: true,
          },
          labelFontSize: 15,
          //interval: 5000,
          lineThickness: 0.1,
          scaleBreaks: {
            autoCalculate: true,
            lineThickness: 0,
            //color: "#F9FDFC",
            collapsibleThreshold: "0%",
            type: "zigzag",

          },

          gridColor: "#414142",

        },
        axisX: {
          includeZero: false,
          stripLines: this.GetStripLines(),
          interval: 1,
          labelFontSize: 15,
          gridThickness: 0,
          tickLength: 0,
          lineThickness: 1
        },
        data: [
          {
            type: "rangeBar",
            yValueFormatString: "#0.## °C",
            markerBorderThickness: 1,
            toolTipContent: "AppName:{appName}<br>LogId:{logId}<br>Type:{logType}<br>Verb:{verb}<br>API:{api}<br>TimeTaken: {time_taken_ms} ms<br> LogTime: {LogTime}",
            dataPoints: dataPoints
            //[
            //     {x:4, label:" "},
            //     {x:3, y:[0,1.4], color: "LightSeaGreen", markerBorderColor: "black", label:" "},
            //     {x:3, y:[1.8,3.1], color: "#008080", markerBorderColor: "#000000", label:" "},
            //     {x:3, y:[3.1,4.7], color: "LightSeaGreen", markerBorderColor: "#000000", label:" "},
            //     {x:3, y:[4.9,5.2], color: "#008080", markerBorderColor: "#000000"},
            //     {x:2, y:[1.1,1.3], color: "#7F3E71", markerBorderColor: "#000000"},
            //     {x:2, y:[3.1,3.3], color: "#AB497A", markerBorderColor: "#000000", label:"Application2"},
            //     {x:2, y:[5.3,5.5], color: "#7F3E71", markerBorderColor: "#000000", label:""},
            //     {x:1, y:[2,2.2], color: "#bf4c41", markerBorderColor: "#000000", label:" "},
            //     {x:1, y:[3,3.2], color: "#660000", markerBorderColor: "#000000", label:" "},
            //     {x:1, y:[11.6,11.8], color: "#bf4c41", markerBorderColor: "#000000", label:" "},
            //     {x:7, y:[0,2], color: "LightSeaGreen", markerBorderColor: "#000000", label:" "},
            //     {x:7, y:[2,6], color: "#008080", markerBorderColor: "#000000"},
            //     {x:7, y:[6,10], color: "LightSeaGreen", markerBorderColor: "#000000"},
            //     {x:7, y:[10,12], color: "#008080", markerBorderColor: "#000000"},
            //     {x:6, y:[0,1], color: "#7F3E71", markerBorderColor: "#000000"},
            //     {x:6, y:[3,4], color: "#AB497A", markerBorderColor: "#000000", label:"Application1"},
            //     {x:6, y:[7.2,7.4], color: "#7F3E71", markerBorderColor: "#000000"},
            //     {x:5, y:[2,3], color: "#bf4c41", markerBorderColor: "#000000", label:" "},
            //     {x:5, y:[3,4], color: "#660000", markerBorderColor: "#000000"},
            //     {x:5, y:[11,12], color: "#bf4c41", markerBorderColor: "#000000"},
            //   ]
          }
        ]
      });
    chart.render();
  }


  Response() {
    console.log(this.logs);
    this.spinner.hide();
  }
}