import { Component, OnInit } from '@angular/core';
import { LogsService } from '../logs.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent{
  id: string;
  searchBarDisplay:boolean;

  constructor(private logsService: LogsService, private spinner: NgxSpinnerService) {
   }

  Search() {
    this.spinner.show();
    this.logsService.GetLogs(this.id);
    this.searchBarDisplay=!this.searchBarDisplay;
  }
  ToggleSearchBar()
  {
    this.searchBarDisplay=!this.searchBarDisplay;
  }
}