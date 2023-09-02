import { ExternalScene } from "./Scene";

export interface Clothing {
  body: string;
  hat?: string;
  hair: string;
  shirt?: string;
  dress?: string;
  pants?: string;
  wings?: string;
  tool?: string;
}

export const SaculNPC: Clothing = {
  body: "Beige Farmer Potion",
  hat: "Halo",
  hair: "Buzz Cut",
  dress: "Cupid Dress",
  wings: "Angel Wings",
  tool: "Dawn Lamp",
};

export type Player = {
  sessionId: string;
  farmId: number;
  x: number;
  y: number;
  clothing: Clothing;
  sceneId: string;
  prop: GameProps;
  propSprite: any;
  health: "alive" | "dead";
  status: "waiting" | "playing";
};

type CommunityModals = {
  type: "speaking" | "loading";
  messages: {
    text: string;
    actions?: { text: string; cb: () => void }[];
  }[];
};

export type GameProps =
  | "wooden_box" // done
  | "wooden_seat" // done
  | "rock" // done
  | "bush" // done
  | "tree" // done
  | "none";

export type PlayerState = {
  status: "waiting" | "playing";
  health: "alive" | "dead";
  prop: GameProps;
  team: "red" | "blue" | "neutral";
};

export type GameState = {
  teams: {
    red: Player[];
    blue: Player[];
  };
  status: "waiting" | "playing";
  nextRound: number;
};

declare global {
  interface Window {
    serverEvents: (event: string, cb: (data: any) => void) => void;
    BaseScene: any;
    PlayScene: any;
    openModal: (modal: CommunityModals) => void;
    closeModal: () => void;
    ExternalScene: typeof ExternalScene;
  }
}
