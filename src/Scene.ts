import {
  Clothing,
  SaculNPC,
  PlayerState,
  GameState,
  Player,
  GameProps,
} from "./types";
import Phaser from "phaser";
import React from "react";
import ReactDOM from "react-dom";

import {
  ModalOne,
  ModalTwo,
  ModalThree,
  ModalEnd,
} from "./CustomComponents/DiscoverIsland";
import { Notification, PropHunt_HUD } from "./CustomComponents/HUD";

export const BASE_URL = "https://0xsacul.github.io/prophunt-community-island/";

let NEXT_MATCH_TIMESTAMP = Date.now() / 1000 + 15;
let NEX_MATCH_REMAINING_TIME = "";
let IS_DISCOVERING_ISLAND = false;

export abstract class ExternalScene extends window.BaseScene {
  constructor() {
    super({
      name: "local",
      map: {
        tilesetUrl: BASE_URL + "tileset.png",
      },
      player: {
        spawn: {
          x: 760, // 256  824
          y: 1280, // 566  140
        },
      },
      mmo: {
        enabled: true,
        url: "wss://plaza.sacul.cloud",
        roomId: "prop_hunt",
        serverId: "prop_hunt",
      },
    });

    // REMOVE THIS ASAP
    this.playerState = {
      status: "waiting",
      health: "alive",
      prop: "none",
      team: "neutral",
    } as PlayerState;

    this.gameState = {
      teams: {
        red: [],
        blue: [],
      },
      status: "waiting",
      nextRound: Date.now() + 60000,
    } as GameState;
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

    // Props
    this.load.image("wooden_box", BASE_URL + "props/wooden_box.png");
    this.load.image("wooden_seat", BASE_URL + "props/wooden_seat.png");
    this.load.image("rock", BASE_URL + "props/rock.png");
    this.load.image("bush", BASE_URL + "props/bush.png");
    this.load.image("tree", BASE_URL + "props/tree.png");
  }

  create() {
    super.create();

    this.initialiseNPCs([
      {
        x: 745,
        y: 1250,
        npc: "Sacul",
        clothing: SaculNPC,
        onClick: () => {
          if (this.CheckPlayerDistance(745, 1240)) return;

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

    const red_team_flag = this.add.sprite(900, 1090, "red_team_flag");
    const blue_team_flag = this.add.sprite(690, 1090, "blue_team_flag");
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

    console.log("PLAYER", this.currentPlayer);
    //this.ServerConnection();
    this.PlaceDefaultProps();
  }

  PlaceDefaultProps() {
    this.placeProp("wooden_box", 725, 1120);
    this.placeProp("wooden_seat", 760, 1120);
    this.placeProp("rock", 785, 1120);
    this.placeProp("bush", 805, 1120);
    this.placeProp("tree", 830, 1120);
  }

  placeProp(prop: GameProps, x: number, y: number) {
    const propSprite = this.add.sprite(x, y, prop);

    // collision
    this.physics.add.existing(propSprite);
    propSprite.body.setCollideWorldBounds(true);
    propSprite.body.setImmovable(true);

    // interaction
    propSprite.setInteractive();
    propSprite.on("pointerdown", () => {
      if (this.CheckPlayerDistance(x, y)) return;
      console.log("clicked on prop", prop);
      this.transformPlayerToProp(this.currentPlayer, prop);
    });
  }

  transformPlayerToProp(player: Player, prop: GameProps) {
    // hide the player, and set their prop and make the prop follow them

    this.currentPlayer.prop = prop;
    this.currentPlayer.status = "playing";
    this.currentPlayer.health = "alive";

    if (player.propSprite) {
      player.propSprite.destroy();
      player.propSprite = null;
    }

    this.currentPlayer.setVisible(false);
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    this.checkZones();
    this.RenderHUD();
    this.renderProps();
  }

  renderProps() {
    const players = [this.currentPlayer];

    if (!players) return;

    players.forEach((player: Player) => {
      if (player.prop && player.prop !== "none") {
        if (player.propSprite) {
          player.propSprite.x = player.x;
          player.propSprite.y = player.y;
        } else {
          const propSprite = this.add.sprite(player.x, player.y, player.prop);
          propSprite.setInteractive();

          player.propSprite = propSprite;
        }
      }
    });
  }

  checkZones() {
    const red_zone = new Phaser.Geom.Circle(1020, 1090, 70);
    const blue_zone = new Phaser.Geom.Circle(560, 1090, 70);

    // check if the player is within the red zone
    if (
      this.playerState.team !== "red" &&
      Phaser.Geom.Circle.Contains(
        red_zone,
        this.currentPlayer.x,
        this.currentPlayer.y
      )
    ) {
      this.playerState.team = "red";
      this.gameState.teams.red.push(this.playerState);
    }

    // check if the player is within the blue zone
    if (
      this.playerState.team !== "blue" &&
      Phaser.Geom.Circle.Contains(
        blue_zone,
        this.currentPlayer.x,
        this.currentPlayer.y
      )
    ) {
      this.playerState.team = "blue";
      this.gameState.teams.blue.push(this.playerState);
    }

    // check if the player is within neither zone
    if (
      this.playerState.team !== "neutral" &&
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
      // remove the player from any team they were previously in
      if (this.playerState.team === "red") {
        this.gameState.teams.red = this.gameState.teams.red.filter(
          (player: { sessionId: any }) =>
            player.sessionId !== this.currentPlayer.sessionId
        );
      } else if (this.playerState.team === "blue") {
        this.gameState.teams.blue = this.gameState.teams.blue.filter(
          (player: { sessionId: any }) =>
            player.sessionId !== this.currentPlayer.sessionId
        );
      }

      this.playerState.team = "neutral";
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
    return NEX_MATCH_REMAINING_TIME;
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

  RenderHUD() {
    if (IS_DISCOVERING_ISLAND) return;

    this.RenderCustomComponents(PropHunt_HUD, {
      playerState: this.playerState,
      gameState: this.gameState,
    });
  }

  ReRenderCustomComponents() {
    this.RenderCustomComponents(PropHunt_HUD, {
      status: this.state.status,
      next_match: this.state.next_match,
      player_red: this.state.player_red,
      player_blue: this.state.player_blue,
      team: this.state.team,
    });
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

    const mainCoords = { x: 785, y: 1170 };
    const blueCoords = { x: 560, y: 1090 };
    const redCoords = { x: 1020, y: 1090 };

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
          },
          callbackScope: this,
        });
      },
      callbackScope: this,
    });
  }
}

window.ExternalScene = ExternalScene;
