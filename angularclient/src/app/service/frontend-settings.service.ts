import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, map, of } from "rxjs";
import {
  DEFAULT_SETTINGS,
  FrontendSettings,
  SettingKeys,
} from "../shared/model/internal/frontend-settings";
import { FrontendSetting } from "./../shared/model/internal/frontend-settings";
import { isValueOfStringEnum } from "src/functions/isValueOfStringEnum";

const LS_KEY = "ampd_userSettings";

@Injectable({
  providedIn: "root",
})
export class FrontendSettingsService {
  pageSizeOptions = [20, 50, 100];

  private settings: FrontendSettings = DEFAULT_SETTINGS;
  private settings$: Observable<FrontendSettings>;
  private settingsSub$: BehaviorSubject<FrontendSettings>;

  constructor() {
    this.settingsSub$ = new BehaviorSubject<FrontendSettings>(
      this.loadFrontendSettings()
    );
    this.settings$ = this.settingsSub$.asObservable();
  }

  save(name: string, value: string | number | boolean): void {
    if (isValueOfStringEnum(SettingKeys, name)) {
      this.settings[name as SettingKeys].value = String(value);
      this.persist();
      this.settingsSub$.next(this.settings);
    } else {
      console.error("Could not find frontend setting with name: ", name);
      return;
    }
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
    const elem = this.settings[key];
    return Number(elem ? elem.value : "");
  }

  getStrValue(key: SettingKeys): string {
    const elem = this.settings[key];
    return String(elem ? elem.value : "");
  }

  getBoolValue(key: SettingKeys): boolean {
    const elem = this.settings[key];
    return elem ? elem.value === "true" : false;
  }

  loadFrontendSettings$(): Observable<FrontendSettings> {
    return this.settings$;
  }

  loadFrontendSettings(): FrontendSettings {
    const lsData = localStorage.getItem(LS_KEY) || "";
    try {
      const savedSettings = Object.entries(<FrontendSettings>JSON.parse(lsData));
      const oldSettingsArray = Object.entries(this.settings);
      for (const [name, setting] of savedSettings) {
        const oldSetting = oldSettingsArray.find(
          (s) => s[0] === name
        );
        if (oldSetting && oldSetting[1].value !== setting.value) {
          console.log(
            `Changing ${name} from "${oldSetting[1].value}" (default value) to "${setting.value}" (user setting)`
          );
          this.settings[name as SettingKeys].value = setting.value;
        }
      }
    } catch (err) {}
    return this.settings;
  }

  reset(): void {
    localStorage.setItem(LS_KEY, "");
  }

  private getValue$(key: SettingKeys): Observable<FrontendSetting> {
    return this.settings$.pipe(
      map((s) => s[key]),
      catchError((err) => {
        console.error("Could not find setting: ", err);
        return of({} as FrontendSetting);
      })
    );
  }

  private persist(): void {
    localStorage.setItem(LS_KEY, JSON.stringify(this.settings));
  }
}
