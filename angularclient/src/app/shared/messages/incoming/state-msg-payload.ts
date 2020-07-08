import { ControlPanel } from "./control-panel";
import { MpdTrack } from "./mpd-track";
import { ServerStatus } from "./server-status";

export interface StateMsgPayload {
  serverStatus: ServerStatus;
  currentSong: MpdTrack;
  cover?: unknown;
  controlPanel: ControlPanel;
}
