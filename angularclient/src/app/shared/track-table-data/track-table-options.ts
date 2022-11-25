import { MatTableDataSource } from "@angular/material/table";
import { Track } from "../messages/incoming/track";
import { QueueTrack } from "../model/queue-track";
import { ClickActions } from "./click-actions.enum";

/**
 * When including the track table in a view, some parameters are needed. Too much, to insert them
 * from the template.
 */
export class TrackTableOptions {
  /**
   * If true, the table as an 'add title' column.
   */
  addTitleColumn = true;

  /**
   * If true, the rows of the table are clickable and a click adds the track to the queue.
   */
  clickable = true;

  /**
   * The tracks that will be displayed in the track table.
   */
  dataSource = new MatTableDataSource<QueueTrack>();

  /**
   *  Reordering tracks via drag & drop
   * */
  dragEnabled = false;

  /**
   * Which columns this track table will have.
   */
  displayedColumns: string[] = [];

  /**
   * The action that will be triggered on a row click.
   */
  onRowClick = ClickActions.AddTrack;

  /**
   * The action that will be triggered on a click on the play button.
   */
  onPlayClick = ClickActions.PlayTrack;

  /**
   * If true, the table as a 'play title' colum.
   */
  playTitleColumn = true;

  /**
   *  If true, the columns of the table are orderable.
   */
  sortable = true;

  /**
   * The default page size.
   */
  pageSize = 50;

  /**
   * Options for the "Paginate by" select.
   */
  pageSizeOptions = [10, 100, 500, 1000];

  /**
   * The length of the total number of items that are being paginated.
   */
  totalElements = 0;

  /**
   * Length of all tracks in the queue in seconds.
   */
  totalPlayTime = -1;

  /**
   * The zero-based page index of the displayed list of items.
   */
  pageIndex = 0;

  /**
   * Amount of pages.
   */
  totalPages = 0;

  /**
   * Show select to change page size
   */
  showPageSizeOptions = true;

  addTracks(tracks: Track[]): void {
    const qt = tracks.map((track, index) => new QueueTrack(track, index));
    this.dataSource.data = qt;
  }
}
