import { Component } from "@angular/core";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { Title } from "@angular/platform-browser";
import { Observable, map } from "rxjs";
import { FrontendSettingsService } from "src/app/service/frontend-settings.service";
import { SettingsService } from "../service/settings.service";
import { AmpdSetting } from "../shared/model/ampd-setting";
import { FrontendSetting, FrontendSettings } from "../shared/model/internal/frontend-settings";
import { MpdSettings } from "../shared/model/mpd-settings";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent {
  mpdSettings: Observable<MpdSettings>;
  ampdSettings: Observable<AmpdSetting[]>;
  feSettings$: Observable<[string, FrontendSetting][]>;

  constructor(
    private fsService: FrontendSettingsService,
    private settingsService: SettingsService,
    private titleService: Title
  ) {
    this.titleService.setTitle("ampd — Settings");
    this.ampdSettings = this.settingsService.getAmpdSettings();
    this.mpdSettings = this.settingsService.getMpdSettings();
    this.feSettings$ = this.fsService.loadFrontendSettings$().pipe(
      map((settings) => Object.entries(settings))
    );
  }

  toggleFrontendSetting(name: string, event: MatSlideToggleChange): void {
    this.fsService.save(name, event.checked);
  }

  onSaveBtnClick(name: string, value: string): void {
    this.fsService.save(name, value);
  }

  resetFrontendSettings(): void {
    this.fsService.reset();
    window.location.reload();
  }
}
