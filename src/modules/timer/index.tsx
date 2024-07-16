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
import { useHintMode, useModal, useModalActions } from "@/shared/modal";
import { Shortcut } from "@/shared/ui/shortcut";
import { SettingsDialog, useInitialFocusTimeInMinutes } from "../settings";

type TimerMode = "focus" | "break";
export function Timer() {
	const [mode, setMode] = useState<TimerMode>("focus");
	const hintMode = useHintMode();

	useHotkeys([
		[
			"shift+t",
			() => setMode((prev) => (prev === "focus" ? "break" : "focus")),
		],
	]);

	return (
		<Tabs
			onValueChange={(value) => setMode(value as TimerMode)}
			value={mode}
			className="flex flex-col"
		>
			<div className="pb-2 flex items-center justify-between">
				<div className="flex items-center gap-2 w-full">
					<h1 className="text-xl font-bold">Countdown</h1>
					<Tooltip open={hintMode}>
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
							<Shortcut
								hint={`Switch to ${mode === "focus" ? "break" : "focus"}`}
							>
								shift+t
							</Shortcut>
						</TooltipContent>
					</Tooltip>
					<div className="ml-auto">
						<SettingsDialog />
					</div>
				</div>
			</div>
			<div className={mode === "focus" ? "flex" : "hidden"}>
				<FocusTimer active={mode === "focus"} />
			</div>
			<div className={mode === "break" ? "flex" : "hidden"}>
				<BreakTimer active={mode === "break"} />
			</div>
		</Tabs>
	);
}

function BreakTimer(props: { active: boolean }) {
	const [initialTimeInSeconds] = useState(5 * 60);
	const sendNotification = useSendNotification({
		title: "Break time over",
	});
	const countdownTimer = useCountdownTimer({
		initialTimeInSeconds,
		onFinished: () => sendNotification(),
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

	return <CountdownTimer key="break-timer" {...countdownTimer} />;
}

function FocusTimer(props: { active: boolean }) {
	const { focus, escape } = useModalActions();
	const initialTimeInMinutes = useInitialFocusTimeInMinutes();
	const modal = useModal();
	const sendNotification = useSendNotification({ title: "Focus time over" });
	const countdownTimer = useCountdownTimer({
		initialTimeInSeconds: initialTimeInMinutes * 60,
		onFinished: () => sendNotification(),
		onPlay: focus,
		onPause: escape,
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
	useEffect(() => {
		if (modal === "idle") {
			countdownTimer.actions.pause();
		}
	}, [modal, countdownTimer.actions]);

	return <CountdownTimer key="focus-timer" {...countdownTimer} />;
}

function useSendNotification(props: { title: string }) {
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
	const hintMode = useHintMode();
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
					<Tooltip open={hintMode}>
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
							<Shortcut hint="Pause countdown">p</Shortcut>
						</TooltipContent>
					</Tooltip>
				)}
				{(status === "paused" || status === "idle") && (
					<Tooltip open={hintMode}>
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
							<Shortcut hint="Start countdown">p</Shortcut>
						</TooltipContent>
					</Tooltip>
				)}
				<Tooltip open={hintMode}>
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
						<Shortcut hint="Reset countdown">r</Shortcut>
					</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
}

function useCountdownTimer({
	initialTimeInSeconds,
	onFinished = () => { },
	onPlay = () => { },
	onPause = () => { },
}: {
	initialTimeInSeconds: number;
	onFinished?: () => void;
	onPlay?: () => void;
	onPause?: () => void;
}) {
	const [status, setStatus] = useState<
		"idle" | "running" | "paused" | "finished"
	>("idle");

	const initialSeconds = Number.isNaN(initialTimeInSeconds)
		? 0
		: initialTimeInSeconds;
	const [seconds, setSeconds] = useState(initialSeconds);

	useEffect(() => setSeconds(initialSeconds), [initialSeconds]);

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
			play: () => {
				setStatus("running");
				onPlay();
			},
			pause: () => {
				setStatus("paused");
				onPause();
			},
			reset: () => {
				setSeconds(initialTimeInSeconds);
				setStatus("idle");
			},
			toggle: () => {
				if (status === "running") {
					setStatus("paused");
					onPause();
				} else {
					setStatus("running");
					onPlay();
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
