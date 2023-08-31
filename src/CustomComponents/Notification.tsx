import React, { useState, useEffect } from "react";
import { InnerPanel } from "./components/Panel";

const BASE_URL = "http://localhost:5500/public";

const TimerIcon = `${BASE_URL}/assets/timer.gif`;
const PlayIcon = `${BASE_URL}/assets/play.png`;
const TrophyIcon = `${BASE_URL}/assets/trophy.png`;
const RedFlagIcon = `${BASE_URL}/red_flag.png`;
const BlueFlagIcon = `${BASE_URL}/blue_flag.png`;

type Props = {
  text: string;
  icon: string;
};

const ICONS = {
  timer: TimerIcon,
  play: PlayIcon,
  trophy: TrophyIcon,
  red_flag: RedFlagIcon,
  blue_flag: BlueFlagIcon,
};

export const Notification: React.FC<Props> = ({ text, icon }) => {
  return (
    <>
      <InnerPanel className="fixed top-2 left-1/2 -translate-x-1/2 flex items-center z-50">
        {icon && <img src={ICONS[icon]} className="w-6 mx-2 my-1" />}
        <span className="text-sm mr-2">{text}</span>
      </InnerPanel>
    </>
  );
};
