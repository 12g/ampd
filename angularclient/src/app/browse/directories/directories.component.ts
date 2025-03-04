import { Component, Input, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { FrontendSettingsService } from "../../service/frontend-settings.service";
import { MsgService } from "../../service/msg.service";
import { Directory } from "../../shared/messages/incoming/directory";
import { Filterable } from "../filterable";

@Component({
  selector: "app-directories",
  templateUrl: "./directories.component.html",
  styleUrls: ["./directories.component.scss"],
})
export class DirectoriesComponent extends Filterable implements OnInit {
  @Input() directories: Directory[] = [];
  @Input() dirQp = "/";

  dirQpLabel = "/";
  filterByStartCharValue = "";
  filterVisible = false;
  letters = new Set<string>();
  pageSizeOptions: number[];
  paginationFrom = 0;
  paginationTo = 30;

  constructor(
    private frontendSettingsService: FrontendSettingsService,
    private messageService: MsgService
  ) {
    super(messageService);
    this.pageSizeOptions = this.frontendSettingsService.pageSizeOptions;
  }

  ngOnInit(): void {
    this.dirQpLabel = decodeURIComponent(this.dirQp);
    this.buildLetters();
  }

  public getPaginatorData(event: PageEvent): PageEvent {
    this.paginationFrom = event.pageIndex * event.pageSize;
    this.paginationTo = this.paginationFrom + event.pageSize;
    return event;
  }

  toggleFilter(): void {
    this.filterVisible = !this.filterVisible;
  }

  setStartLetterFilter(letter: string): void {
    if (letter === "") {
      this.filterVisible = false;
    }
    this.filterByStartCharValue = letter.substring(0, 1).toUpperCase();
  }

  private buildLetters(): void {
    const letters = new Set<string>();
    this.directories.forEach((val) => {
      letters.add(val.path.substring(0, 1).toUpperCase());
    });
    this.letters = letters;
  }
}
