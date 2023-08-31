import { Clothing, SaculNPC, ExternalSceneOptions } from "./types";
import Phaser from "phaser";
import React from "react";
import ReactDOM from "react-dom";

import { PlayScene } from "./PlayScene";

import {
  ModalOne,
  ModalTwo,
  ModalThree,
  ModalEnd,
} from "./CustomComponents/DiscoverIsland";
import { Notification } from "./CustomComponents/Notification";

export const BASE_URL = "http://localhost:5500/public/";

let CURRENT_ZONE = "neutral" as "red" | "blue" | "neutral";
let NEXT_MATCH_TIMESTAMP = Date.now() / 1000 + 15;
let NEX_MATCH_REMAINING_TIME = "";
let IS_DISCOVERING_ISLAND = false;

export abstract class ExternalScene extends window.BaseScene {
  constructor(options: ExternalSceneOptions) {
    super({
      name: "local",
      map: {
        tilesetUrl: BASE_URL + "tileset.png",
      },
      player: {
        spawn: {
          x: 760, // 256  824
          y: 635, // 566  140
        },
      },
      mmo: {
        enabled: true,
        //url: "ws://localhost:2567/",
        //roomId: "local", // Need to be ingals_main once fixed on SFL side.
      },
    });
  }

  preload() {
    super.preload();

    this.load.bitmapFont(
      "Small 5x3",
      "world/small_3x5.png",
      "world/small_3x5.xml"
    );
    this.load.bitmapFont("pixelmix", "world/7px.png", "world/7px.xml");
    this.load.bitmapFont(
      "Teeny Tiny Pixls",
      "world/Teeny Tiny Pixls5.png",
      "world/Teeny Tiny Pixls5.xml"
    );

    // Team Flags
    this.load.spritesheet("red_team_flag", BASE_URL + "red_team_flag.png", {
      frameWidth: 11,
      frameHeight: 16,
    });

    this.load.spritesheet("blue_team_flag", BASE_URL + "blue_team_flag.png", {
      frameWidth: 11,
      frameHeight: 16,
    });
  }

  create() {
    super.create();

    this.initialiseNPCs([
      {
        x: 745,
        y: 610,
        npc: "Sacul",
        clothing: SaculNPC,
        onClick: () => {
          if (this.CheckPlayerDistance(745, 610)) return;

          window.openModal({
            type: "speaking",
            messages: [
              {
                text: "Howdy Farmer! I'm Sacul, the CEO of dumb dumb games. I'm here to help you get started on your journey to play here!",
              },
              {
                text: "This is a Prop Hunt game, where you can hide as a prop or hunt down the props.",
              },
              {
                text: "It's a lot of fun, and I hope you enjoy it! If you need, I can show you how eveything works here.",
                actions: [
                  {
                    text: "Yes, please!",
                    cb: () => {
                      this.DiscoverIslandAnimation();
                    },
                  },
                  {
                    text: "No, thanks.",
                    cb: () => {
                      window.closeModal();
                    },
                  },
                ],
              },
            ],
          });
        },
      },
    ]);

    const red_team_flag = this.add.sprite(895, 450, "red_team_flag");
    const blue_team_flag = this.add.sprite(690, 450, "blue_team_flag");
    this.anims.create({
      key: "red_team_flag",
      frames: this.anims.generateFrameNumbers("red_team_flag", {
        start: 0,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "blue_team_flag",
      frames: this.anims.generateFrameNumbers("blue_team_flag", {
        start: 0,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });

    red_team_flag.anims.play("red_team_flag", true);
    blue_team_flag.anims.play("blue_team_flag", true);

    // For local testing, allow Scene refresh with spacebar
    this.events.on("shutdown", () => {
      this.cache.tilemap.remove("local");
      this.scene.remove("local");
    });
    const spaceBar = this.input.keyboard.addKey("SPACE");
    spaceBar.on("down", () => {
      this.scene.start("default");
    });

    this.RenderCustomComponents(Notification, {
      text:
        "Next Match is starting in " +
        this.DefineNextMatchRemainingTime() +
        " minutes!",

      icon: "timer",
    });

    // redefine next match remaining time every 1 second
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (IS_DISCOVERING_ISLAND && CURRENT_ZONE !== "neutral") return;
        this.DefineNextMatchRemainingTime();
      },
    });
  }

  update() {
    super.update();

    // define the red & blue zones by creating a radius around the flags and checking if the player is within that radius
    const red_zone = new Phaser.Geom.Circle(1020, 450, 70);
    const blue_zone = new Phaser.Geom.Circle(560, 450, 70);

    // check if the player is within the red zone
    if (
      CURRENT_ZONE !== "red" &&
      Phaser.Geom.Circle.Contains(
        red_zone,
        this.currentPlayer.x,
        this.currentPlayer.y
      )
    ) {
      this.RenderCustomComponents(Notification, {
        text: "You are in the red zone!",
        icon: "red_flag",
      });
      CURRENT_ZONE = "red";
    }

    // check if the player is within the blue zone
    if (
      CURRENT_ZONE !== "blue" &&
      Phaser.Geom.Circle.Contains(
        blue_zone,
        this.currentPlayer.x,
        this.currentPlayer.y
      )
    ) {
      this.RenderCustomComponents(Notification, {
        text: "You are in the blue zone!",
        icon: "blue_flag",
      });
      CURRENT_ZONE = "blue";
    }

    // check if the player is within neither zone
    if (
      CURRENT_ZONE !== "neutral" &&
      !Phaser.Geom.Circle.Contains(
        red_zone,
        this.currentPlayer.x,
        this.currentPlayer.y
      ) &&
      !Phaser.Geom.Circle.Contains(
        blue_zone,
        this.currentPlayer.x,
        this.currentPlayer.y
      )
    ) {
      CURRENT_ZONE = "neutral";
    }
  }

  DefineNextMatchRemainingTime() {
    if (IS_DISCOVERING_ISLAND) return;

    const now = new Date().getTime();
    const distance = NEXT_MATCH_TIMESTAMP * 1000 - now;
    const minutes = Math.floor(
      (distance % (1000 * 60 * 60)) / (1000 * 60)
    ).toString();
    const seconds = Math.floor((distance % (1000 * 60)) / 1000).toString();

    NEX_MATCH_REMAINING_TIME = minutes + ":" + seconds;

    if (CURRENT_ZONE === "neutral") {
      this.RenderCustomComponents(Notification, {
        text:
          distance > 0
            ? "Next Match is starting in " + NEX_MATCH_REMAINING_TIME + " !"
            : "Next Match is starting now!",
        icon: distance > 0 ? "timer" : "play",
      });
    }
  }

  CheckPlayerDistance(x: number, y: number) {
    let player_distance = Phaser.Math.Distance.Between(
      this.currentPlayer.x,
      this.currentPlayer.y,
      x,
      y
    );
    return player_distance > 40;
  }

  RenderCustomComponents(component: any, props: any = {}) {
    ReactDOM.render(
      React.createElement(component, props),
      document.getElementById("community-root")
    );
  }

  UnRenderCustomComponents() {
    ReactDOM.render(
      React.createElement("div", null, null),
      document.getElementById("community-root")
    );
  }

  DiscoverIslandAnimation() {
    const camera = this.cameras.main;
    const player = this.currentPlayer;

    const mainCoords = { x: 785, y: 520 };
    const blueCoords = { x: 560, y: 450 };
    const redCoords = { x: 1020, y: 450 };

    // Disable player follow for the entire animation sequence
    IS_DISCOVERING_ISLAND = true;
    camera.stopFollow();
    window.closeModal();
    this.UnRenderCustomComponents();

    // Transition to main coordinates
    this.time.addEvent({
      delay: 0,
      callback: () => {
        camera.pan(mainCoords.x, mainCoords.y, 2000, "Sine.easeInOut", false);
        this.RenderCustomComponents(ModalOne);
      },
      callbackScope: this,
    });

    // Transition to blue coordinates
    this.time.addEvent({
      delay: 7500,
      callback: () => {
        camera.pan(blueCoords.x, blueCoords.y, 2000, "Sine.easeInOut", false);
        this.RenderCustomComponents(ModalTwo);
      },
      callbackScope: this,
    });

    // Transition to red coordinates
    this.time.addEvent({
      delay: 15000,
      callback: () => {
        camera.pan(redCoords.x, redCoords.y, 2000, "Sine.easeInOut", false);
        this.RenderCustomComponents(ModalThree);
      },
      callbackScope: this,
    });

    // Transition back to player coordinates and re-enable follow
    this.time.addEvent({
      delay: 22500,
      callback: () => {
        camera.pan(player.x, player.y, 2000, "Sine.easeInOut", false);
        this.RenderCustomComponents(ModalEnd);
        this.time.addEvent({
          delay: 5000,
          callback: () => {
            camera.startFollow(player);
            IS_DISCOVERING_ISLAND = false;
            this.UnRenderCustomComponents();
            this.RenderCustomComponents(Notification, {
              text: "Next Match is starting in 5 minutes!",
              icon: "timer",
            });
          },
          callbackScope: this,
        });
      },
      callbackScope: this,
    });
  }
}

window.ExternalScene = ExternalScene;
