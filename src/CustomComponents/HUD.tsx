import React, { useState, useEffect } from "react";
import { InnerPanel } from "./components/Panel";
import { PlayerState, GameState } from "../types";

const BASE_URL = "https://0xsacul.github.io/prophunt-community-island/";

const TimerIcon = `${BASE_URL}assets/timer.gif`;
const PlayIcon = `${BASE_URL}assets/play.png`;
const TrophyIcon = `${BASE_URL}assets/trophy.png`;
const RedFlagIcon = `${BASE_URL}red_flag.png`;
const BlueFlagIcon = `${BASE_URL}blue_flag.png`;

type Props = {
  playerState: PlayerState;
  gameState: GameState;
};

type NotificaionProps = {
  text: string;
  icon: string;
};

const ICONS: Record<string, string> = {
  timer: TimerIcon,
  play: PlayIcon,
  trophy: TrophyIcon,
  red_flag: RedFlagIcon,
  blue_flag: BlueFlagIcon,
};

export const PropHunt_HUD: React.FC<Props> = ({ playerState, gameState }) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [timeUntilNextMatch, setTimeUntilNextMatch] = useState<string>("");

  useEffect(() => {
    if (playerState.status === "waiting") {
      const interval = setInterval(() => {
        // Calculate the time left until the next match
        const timeDifference = gameState.nextRound - Date.now();
        const minutes = Math.floor(timeDifference / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        // Format minutes and seconds as MM:SS
        const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;

        setTimeUntilNextMatch(timeDifference > 0 ? formattedTime : "00:00");
      }, 1000);

      // Clean up the interval when the component unmounts or when status or nextRound changes
      return () => {
        clearInterval(interval);
      };
    }
  }, [playerState.status, gameState.nextRound]);

  return (
    <>
      {timeUntilNextMatch && (
        <InnerPanel className="fixed top-2 left-1/2 -translate-x-1/2 flex items-center z-50">
          {playerState.status === "waiting" && (
            <>
              <img
                src={
                  timeUntilNextMatch === "00:00"
                    ? ICONS["play"]
                    : ICONS["timer"]
                }
                className="w-6 mx-2 my-1"
              />
              <div className="flex flex-col items-center">
                <span className="text-sm mr-2">
                  {timeUntilNextMatch === "00:00"
                    ? "Match is starting..."
                    : timeUntilNextMatch + " until next match"}
                </span>
                <div className="flex items-center justify-between">
                  <img src={ICONS["blue_flag"]} className="w-3 mx-1 my-1" />
                  <span className="text-sm mr-2">
                    {gameState.teams.blue.length} vs{" "}
                    {gameState.teams.red.length}
                  </span>
                  <img src={ICONS["red_flag"]} className="w-3 mx-1 my-1" />
                </div>
              </div>
            </>
          )}
          {playerState.status === "playing" && <></>}
        </InnerPanel>
      )}
    </>
  );
};

export const Notification: React.FC<NotificaionProps> = ({ text, icon }) => {
  return (
    <>
      <InnerPanel className="fixed top-2 left-1/2 -translate-x-1/2 flex items-center z-50">
        {icon && <img src={ICONS[icon]} className="w-6 mx-2 my-1" />}
        <span className="text-sm mr-2">{text}</span>
      </InnerPanel>
    </>
  );
};
