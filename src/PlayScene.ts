import PlayMap from "../public/play_map.json";

import { ExternalScene } from "./Scene";

export class PlayScene extends ExternalScene {
  sceneId = "play_scene";

  constructor() {
    super({
      name: "corn_maze",
      map: {
        json: PlayMap,
      },
    });
  }

  async create() {
    this.map = this.make.tilemap({
      key: "play_map",
    });

    super.create();
  }
}
