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

type CommunityModals = {
  type: "speaking" | "loading";
  messages: {
    text: string;
    actions?: { text: string; cb: () => void }[];
  }[];
};

export type ExternalSceneOptions = {
  name: string;
  map: {
    tilesetUrl?: string;
    json: any;
    padding?: [number, number];
  };
  mmo?: {
    enabled: boolean;
    url?: string;
    serverId?: string;
    sceneId?: string;
  };
  controls?: {
    enabled: boolean; // Default to true
  };
  player?: {
    spawn: {
      x: number;
      y: number;
    };
  };
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
