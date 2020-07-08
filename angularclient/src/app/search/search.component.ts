import { Component, OnInit, ViewChild } from "@angular/core";

import { MpdTrack } from "../shared/messages/incoming/mpd-track";
import {
  SearchMsgPayload,
  SearchResult,
} from "../shared/messages/incoming/search";
import { QueueTrack } from "../shared/models/queue-track";
import { MpdCommands } from "../shared/mpd/mpd-commands";
import { WebSocketService } from "../shared/services/web-socket.service";
import { DeviceDetectorService } from "ngx-device-detector";
import { NotificationService } from "../shared/services/notification.service";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource<QueueTrack>([]);
  searchResultCount = 0;
  search = "";
  spinnerVisible = false;

  private displayedColumns = [
    { name: "artistName", showMobile: true },
    { name: "albumName", showMobile: false },
    { name: "title", showMobile: true },
    { name: "length", showMobile: false },
    { name: "addTitle", showMobile: true },
    { name: "playTitle", showMobile: true },
  ];

  constructor(
    private notificationService: NotificationService,
    private webSocketService: WebSocketService,
    private deviceService: DeviceDetectorService
  ) {
    this.buildMsgReceiver();
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onPlayTitle(track: MpdTrack): void {
    this.webSocketService.sendData(MpdCommands.ADD_PLAY_TRACK, {
      path: track.file,
    });
    this.notificationService.popUp(`Playing: ${track.title}`);
  }

  onAddTitle(track: MpdTrack): void {
    this.webSocketService.sendData(MpdCommands.ADD_TRACK, {
      path: track.file,
    });
    this.notificationService.popUp(`Added: ${track.title}`);
  }

  applySearch(searchValue: string): void {
    this.search = searchValue;
    if (searchValue) {
      // Only search when the term is at least 3 chars long
      if (searchValue.length > 2) {
        this.webSocketService.sendData(MpdCommands.SEARCH, {
          query: searchValue,
        });
        this.spinnerVisible = true;
      }
    } else {
      this.resetSearch();
    }
  }

  resetSearch(): void {
    this.dataSource.data = [];
    this.searchResultCount = 0;
  }

  getDisplayedColumns(): string[] {
    const isMobile = this.deviceService.isMobile();
    return this.displayedColumns
      .filter((cd) => !isMobile || cd.showMobile)
      .map((cd) => cd.name);
  }

  /**
   * Listen for results on the websocket channel
   */
  private buildMsgReceiver(): void {
    this.webSocketService
      .getSearchSubscription()
      .subscribe((message: SearchMsgPayload) =>
        this.processSearchResults(
          message.searchResults,
          message.searchResultCount
        )
      );
  }

  private processSearchResults(
    searchResults: SearchResult[],
    searchResultCount: number
  ): void {
    this.resetSearch();
    const tableData = [];
    searchResults.forEach((track: SearchResult) => {
      tableData.push(new QueueTrack(track));
    });
    this.dataSource = new MatTableDataSource<QueueTrack>(tableData);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.searchResultCount = searchResultCount;
    this.spinnerVisible = false;
  }
}
