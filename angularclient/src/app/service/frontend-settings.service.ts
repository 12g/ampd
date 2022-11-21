import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable } from "rxjs";
import {
  backendAddr,
  darkTheme,
  displayCovers,
  displayInfoBtn,
  SettingKeys,
  updateTabTitle,
} from "../shared/model/internal/frontend-settings";
import { DarkTheme, LightTheme } from "../shared/themes/themes";
import { FrontendSetting } from "./../shared/model/internal/frontend-settings";

const LS_KEY = "ampd_userSettings";

@Injectable({
  providedIn: "root",
})
export class FrontendSettingsService {
  pageSizeOptions = [20, 50, 100];

  private settings: FrontendSetting[] = [
    darkTheme,
    displayCovers,
    updateTabTitle,
    displayInfoBtn,
    backendAddr,
  ];
  private settings$: Observable<FrontendSetting[]>;
  private settingsSub$: BehaviorSubject<FrontendSetting[]>;

  constructor() {
    this.settingsSub$ = new BehaviorSubject<FrontendSetting[]>(
      this.loadFrontendSettingsNg()
    );
    this.settings$ = this.settingsSub$.asObservable();
    this.getBoolValue$(SettingKeys.DARK_THEME).subscribe((isDark) =>
      this.setTheme(isDark)
    );
  }

  save(name: string, value: string | number | boolean): void {
    const index = this.settings.findIndex((s) => s.name === name);

    if (index === -1) {
      console.error("Could not find frontend setting with name: ", name);
      return;
    }

    this.settings[index].value = String(value);

    if (this.settings[index].name === SettingKeys.DARK_THEME) {
      // Apply the new theme immediately
      this.setTheme(value === "true");
    }

    this.persist();
    this.settingsSub$.next(this.settings);
  }

  getIntValue$(key: SettingKeys): Observable<number> {
    return this.getValue$(key).pipe(map((s) => Number(s.value)));
  }

  getStrValue$(key: SettingKeys): Observable<string> {
    return this.getValue$(key).pipe(map((s) => String(s.value)));
  }

  getBoolValue$(key: SettingKeys): Observable<boolean> {
    return this.getValue$(key).pipe(map((s) => s.value === "true"));
  }

  getIntValue(key: SettingKeys): number {
    const elem = this.settings.find((s) => s.name === key);
    return Number(elem ? elem.value : "");
  }

  getStrValue(key: SettingKeys): string {
    const elem = this.settings.find((s) => s.name === key);
    return String(elem ? elem.value : "");
  }

  getBoolValue(key: SettingKeys): boolean {
    const elem = this.settings.find((s) => s.name === key);
    return elem ? elem.value === "true" : false;
  }

  loadFrontendSettingsNg(): FrontendSetting[] {
    const lsData = localStorage.getItem(LS_KEY) || "";
    try {
      const savedSettings = <FrontendSetting[]>JSON.parse(lsData);
      for (const setting of savedSettings) {
        const elem = this.settings.find(
          (s) => s.name === setting.name && s.value !== setting.value
        );
        if (elem) {
          console.log(
            `Changing ${elem.name} from "${elem.value}" (default value) to "${setting.value}" (user setting)`
          );
          elem.value = setting.value;
        }
      }
    } catch (err) {}
    return this.settings;
  }

  private getValue$(key: SettingKeys): Observable<FrontendSetting> {
    return this.settings$.pipe(
      map((s) => {
        const elem = s.find((it) => it.name === key);
        if (elem) {
          return elem;
        } else {
          console.error("Could not find setting: ", key);
          return <FrontendSetting>{};
        }
      })
    );
  }

  private persist(): void {
    localStorage.setItem(LS_KEY, JSON.stringify(this.settings));
  }

  private setTheme(isDarkTheme: boolean): void {
    const theme = isDarkTheme ? DarkTheme : LightTheme;
    theme.forEach((value, prop) => {
      document.documentElement.style.setProperty(prop, value);
    });
  }
}
