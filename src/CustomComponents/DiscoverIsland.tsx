import React, { useState } from "react";

import { SpeakingModal } from "./components/SpeakingModal";

export const ModalOne: React.FC = () => {
  return (
    <div
      className="fixed bottom-4 left-1/2 w-[90%] z-50"
      style={{ transform: "translateX(-50%)" }}
    >
      <SpeakingModal
        onClose={() => {}}
        message={[
          {
            text: "So this is the main Island, you can come here to rest and wait for the next match.",
          },
        ]}
        showContinue={false}
      />
    </div>
  );
};

export const ModalTwo: React.FC = () => {
  return (
    <div
      className="fixed bottom-4 left-1/2 w-[90%] z-50"
      style={{ transform: "translateX(-50%)" }}
    >
      <SpeakingModal
        onClose={() => {}}
        message={[
          {
            text: "Here, it's the Blue Team Island, also known as the Props Team. Go on this Island the start the next match as a Prop. As long as you stay on this Island, you will be a Prop.",
          },
        ]}
        showContinue={false}
      />
    </div>
  );
};

export const ModalThree: React.FC = () => {
  return (
    <div
      className="fixed bottom-4 left-1/2 w-[90%] z-50"
      style={{ transform: "translateX(-50%)" }}
    >
      <SpeakingModal
        onClose={() => {}}
        message={[
          {
            text: "And here, it's the Red Team Island, also known as the Hunters Team. Go on this Island the start the next match as a Hunter. As long as you stay on this Island, you will be a Hunter.",
          },
        ]}
        showContinue={false}
      />
    </div>
  );
};

export const ModalEnd: React.FC = () => {
  return (
    <div
      className="fixed bottom-4 left-1/2 w-[90%] z-50"
      style={{ transform: "translateX(-50%)" }}
    >
      <SpeakingModal
        onClose={() => {}}
        message={[
          {
            text: "That's all for the visit, if you have any question feel free to tag Sacul on Discord, much love Bumpkins!",
          },
        ]}
        showContinue={false}
      />
    </div>
  );
};
