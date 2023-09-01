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
};

type CommunityModals = {
  type: "speaking" | "loading";
  messages: {
    text: string;
    actions?: { text: string; cb: () => void }[];
  }[];
};

type GameProps =
  | "wooden_box"
  | "wooden_crate"
  | "wooden_barrel"
  | "wooden_seat"
  | "rock"
  | "bush"
  | "tree"
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
    BaseScene: any;
    PlayScene: any;
    openModal: (modal: CommunityModals) => void;
    closeModal: () => void;
    ExternalScene: typeof ExternalScene;
  }
}
