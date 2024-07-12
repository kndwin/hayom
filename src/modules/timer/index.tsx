import { useState, useEffect, useRef } from "react";
import { PlayIcon, PauseIcon, ResetIcon } from "@radix-ui/react-icons";

import { Button } from "@/shared/ui/button";
import invariant from "tiny-invariant";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useHotkeys } from "@/shared/hooks/use-hotkeys";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { useModal } from "@/shared/modal";
import { Shortcut } from "@/shared/ui/shortcut";

export function Timer() {
  const [type, setType] = useState<"focus" | "break">("focus");
  const modal = useModal();

  useHotkeys([
    [
      "shift+t",
      () => setType((prev) => (prev === "focus" ? "break" : "focus")),
    ],
  ]);

  return (
    <Tabs
      onValueChange={(value) => setType(value)}
      value={type}
      className="flex flex-col"
    >
      <div className="pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Countdown</h1>
          <Tooltip open={modal === "hint"}>
            <TooltipTrigger>
              <TabsList tabIndex={-1} className="h-8">
                <TabsTrigger tabIndex={-1} className="h-6" value="focus">
                  Focus
                </TabsTrigger>
                <TabsTrigger tabIndex={-1} className="h-6" value="break">
                  Break
                </TabsTrigger>
              </TabsList>
            </TooltipTrigger>
            <TooltipContent side="right">
              <TooltipArrow />
              <Shortcut>Shift + t</Shortcut>
              <span className="ml-3">{`Switch to ${
                type === "focus" ? "break" : "focus"
              }`}</span>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className={type === "focus" ? "flex" : "hidden"}>
        <FocusTimer active={type === "focus"} />
      </div>
      <div className={type === "break" ? "flex" : "hidden"}>
        <BreakTimer active={type === "break"} />
      </div>
    </Tabs>
  );
}

function BreakTimer(props: { active: boolean }) {
  const [initialTimeInSeconds, setInitialTimeInSeconds] = useState(5 * 60);
  const sendNotifcation = useSendNotfication({
    title: "Break time over",
  });
  const countdownTimer = useCountdownTimer({
    initialTimeInSeconds,
    onFinished: () => {
      sendNotifcation();
    },
  });

  function togglePlayPause() {
    if (!props.active) {
      return;
    }
    countdownTimer.actions.toggle();
  }

  function reset() {
    if (!props.active) {
      return;
    }
    countdownTimer.actions.reset();
  }

  useHotkeys([["p", togglePlayPause]]);
  useHotkeys([["r", reset]]);

  return <CountdownTimer {...countdownTimer} />;
}

function FocusTimer(props: { active: boolean }) {
  const [initialTimeInSeconds, setInitialTimeInSeconds] = useState(25 * 60);
  const sendNotifcation = useSendNotfication({
    title: "Focus time over",
  });
  const countdownTimer = useCountdownTimer({
    initialTimeInSeconds,
    onFinished: () => {
      sendNotifcation();
    },
  });

  function togglePlayPause() {
    if (!props.active) {
      return;
    }
    countdownTimer.actions.toggle();
  }

  function reset() {
    if (!props.active) {
      return;
    }
    countdownTimer.actions.reset();
  }

  useHotkeys([["p", togglePlayPause]]);
  useHotkeys([["r", reset]]);

  return <CountdownTimer {...countdownTimer} />;
}

function useSendNotfication(props: { title: string }) {
  return () => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(props.title, {
          badge: "https://vitejs.dev/logo.svg",
        });
      }
    });
  };
}

function CountdownTimer(props: ReturnType<typeof useCountdownTimer>) {
  const { actions, status, seconds } = props;
  const modal = useModal();
  const formatted = {
    seconds: (seconds % 60).toString().padStart(2, "0"),
    minutes: Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0"),
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-5xl font-bold tabular-nums">
        {`${formatted.minutes}:${formatted.seconds}`}
      </p>
      <div className="flex items-center ml-3">
        {status === "running" && (
          <Tooltip open={modal === "hint"}>
            <TooltipTrigger>
              <Button
                tabIndex={-1}
                variant="ghost"
                size="icon"
                onClick={actions.pause}
              >
                <PauseIcon className="h-4 w-4  text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <TooltipArrow />
              <Shortcut>p</Shortcut>
              <span className="ml-3">Pause countdown</span>
            </TooltipContent>
          </Tooltip>
        )}
        {(status === "paused" || status === "idle") && (
          <Tooltip open={modal === "hint"}>
            <TooltipTrigger>
              <Button
                tabIndex={-1}
                variant="ghost"
                size="icon"
                onClick={actions.play}
              >
                <PlayIcon className="h-4 w-4 text-green-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={-2}>
              <TooltipArrow />
              <Shortcut>p</Shortcut>
              <span className="ml-3">Start countdown</span>
            </TooltipContent>
          </Tooltip>
        )}
        <Tooltip open={modal === "hint"}>
          <TooltipTrigger>
            <Button
              tabIndex={-1}
              variant="ghost"
              size="icon"
              onClick={actions.reset}
            >
              <ResetIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <TooltipArrow />
            <Shortcut>r</Shortcut>
            <span className="ml-3">Reset timer</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function useCountdownTimer({
  initialTimeInSeconds,
  onFinished = () => {},
}: {
  initialTimeInSeconds: number;
  onFinished?: () => void;
}) {
  const [status, setStatus] = useState<
    "idle" | "running" | "paused" | "finished"
  >("idle");

  const [seconds, setSeconds] = useState(initialTimeInSeconds);

  useInterval(
    () => {
      switch (status) {
        case "running":
          if (seconds === 0) {
            setStatus("finished");
            onFinished();
            break;
          }
          setSeconds(seconds - 1);
          break;
        default:
          break;
      }
    },
    status === "running" ? 1000 : null
  );

  return {
    seconds,
    status,
    actions: {
      play: () => setStatus("running"),
      pause: () => setStatus("paused"),
      reset: () => {
        setSeconds(initialTimeInSeconds);
        setStatus("idle");
      },
      toggle: () => {
        if (status === "running") {
          setStatus("paused");
        } else {
          setStatus("running");
        }
      },
    },
  };
}

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      invariant(savedCallback.current);
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
