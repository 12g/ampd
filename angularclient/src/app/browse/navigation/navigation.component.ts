import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MpdCommands } from '../../shared/mpd/mpd-commands';
import { BrowseService } from '../../shared/services/browse.service';
import { NotificationService } from '../../shared/services/notification.service';
import { WebSocketService } from '../../shared/services/web-socket.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent implements OnInit {
  public getParamDir = '';

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private browseService: BrowseService,
    private activatedRoute: ActivatedRoute,
    private webSocketService: WebSocketService
  ) {}

  public ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      const dir = queryParams.dir || '/';
      this.getParamDir = dir;
      this.browseService.sendBrowseReq(dir);
    });
  }

  public onMoveDirUp(): void {
    const splitted = this.getParamDir.split('/');
    splitted.pop();
    let targetDir = splitted.join('/');
    if (targetDir.length === 0) {
      targetDir = '/';
    }
    this.router
      .navigate(['browse'], { queryParams: { dir: targetDir } })
      .then(fulfilled => {
        if (fulfilled) {
          this.getParamDir = targetDir;
        }
      });
  }

  @HostListener('click', ['$event'])
  public onAddDir(dir: string): void {
    if (event) {
      event.stopPropagation();
    }
    if (typeof dir !== 'string') {
      return;
    }
    if (dir.startsWith('/')) {
      dir = dir.substr(1, dir.length);
    }
    this.webSocketService.sendData(MpdCommands.ADD_DIR, {
      dir,
    });
    this.notificationService.popUp(`Added dir: "${dir}"`);
  }

  @HostListener('click', ['$event'])
  public onPlayDir(dir: string): void {
    if (typeof dir !== 'string') {
      return;
    }
    this.onAddDir(dir);
    this.webSocketService.send(MpdCommands.SET_PLAY);
    this.notificationService.popUp(`Playing dir: "${dir}"`);
  }

  public onClearQueue(): void {
    this.webSocketService.send(MpdCommands.RM_ALL);
    this.webSocketService.send(MpdCommands.GET_QUEUE);
    this.notificationService.popUp('Cleared queue');
  }
}
