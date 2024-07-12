import { createStore } from "@xstate/store";
import { useSelector } from "@xstate/store/react";
import { useState } from "react";
import { GearIcon } from "@radix-ui/react-icons";

import { useHotkeys } from "@/shared/hooks/use-hotkeys";
import { useHintMode } from "@/shared/modal";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Shortcut } from "@/shared/ui/shortcut";
import { Switch } from "@/shared/ui/switch";
import { Slider } from "@/shared/ui/slider";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { useTheme } from "@/shared/providers/theme";

const store = createStore(
  {
    focusTimeInMinutes: 25,
    breakTimeInMinutes: 5,
    theme: "dark",
  },
  {
    SET_FOCUS_TIME: (ctx, evt: { initialTimeInMinutes: number }) => ({
      focusTimeInMinutes: evt.initialTimeInMinutes,
    }),
    TOOGLE_THEME: (prev) => ({
      theme: prev.theme === "light" ? "dark" : "light",
    }),
  }
);

export function useInitialFocusTimeInMinutes() {
  const initialFocusTime = useSelector(
    store,
    (s) => s.context.focusTimeInMinutes
  );
  return initialFocusTime;
}

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const hintMode = useHintMode();

  useHotkeys([[".", () => setOpen(true)]]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Tooltip open={hintMode}>
          <TooltipTrigger>
            <GearIcon />
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <TooltipArrow />
            <Shortcut hint="Open settings dialog">.</Shortcut>
          </TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <TimerSettings />
        <ThemeSettings />
      </DialogContent>
    </Dialog>
  );
}

function TimerSettings() {
  const initialFocusTime = useInitialFocusTimeInMinutes();
  return (
    <div>
      <h2 className="font-medium">Countdown</h2>
      <div className="flex items-center gap-2">
        <p className="text-sm text-nowrap mr-3">Focus time</p>
        <span className="text-xs">15</span>
        <Slider
          min={15}
          max={35}
          defaultValue={[initialFocusTime]}
          onValueChange={(value) =>
            store.send({
              type: "SET_FOCUS_TIME",
              initialTimeInMinutes: value[0],
            })
          }
        />
        <span className="text-xs">35</span>
      </div>
    </div>
  );
}

function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }
  return (
    <div>
      <h2 className="font-medium">Theme</h2>
      <div className="flex items-center gap-1">
        <p className="text-sm">Select a theme: </p>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs">Light</span>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          <span className="text-xs">Dark</span>
        </div>
      </div>
    </div>
  );
}
