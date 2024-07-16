import { createStore } from "@xstate/store";
import { useSelector } from "@xstate/store/react";
import { useState } from "react";
import {
	CheckIcon,
	CopyIcon,
	EyeOpenIcon,
	GearIcon,
	MoonIcon,
	Pencil2Icon,
	SunIcon,
} from "@radix-ui/react-icons";

import { useHotkeys } from "@/shared/hooks/use-hotkeys";
import { useHintMode } from "@/shared/modal";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
} from "@/shared/ui/dialog";
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
import { Logo } from "@/shared/icons/logo";
import { useOwner } from "@evolu/common-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { evolu } from "../todos/db";
import { parseMnemonic } from "@evolu/common";
import { Effect, Exit } from "effect";

const store = createStore(
	{
		focusTimeInMinutes: 25,
		breakTimeInMinutes: 5,
		theme: "dark",
	},
	{
		SET_FOCUS_TIME: (_, evt: { initialTimeInMinutes: number }) => ({
			focusTimeInMinutes: evt.initialTimeInMinutes,
		}),
		TOGGLE_THEME: (prev) => ({
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
					<div className="flex gap-2 items-center">
						<Logo />
						<DialogTitle>Hayom</DialogTitle>
					</div>
				</DialogHeader>
				<TimerSettings />
				<ThemeSettings />
				<SyncSettings />
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
				<p className="text-sm text-nowrap mr-3">Focus time: </p>
				<div className="w-60 ml-auto flex items-center gap-3">
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
				</div>
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
			<div className="flex flex-row items-center  gap-1 w-full justify-between">
				<p className="text-sm">Select a theme: </p>
				<div className="flex items-center gap-1">
					<SunIcon className="w-3 h-4" />
					<Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
					<MoonIcon className="w-3 h-4" />
				</div>
			</div>
		</div>
	);
}

function SyncSettings() {
	const owner = useOwner();
	const [mnemonics, setMnemonics] = useState([
		owner?.mnemonic
	])


	function updateOwner({
		mnemonic, onSuccess = () => { }
	}: {
		mnemonic: string
		onSuccess: () => void
	}) {
		parseMnemonic(mnemonic)
			.pipe(Effect.runPromiseExit)
			.then(
				Exit.match({
					onFailure: () => { },
					onSuccess: (m) => {
						evolu.restoreOwner(m);
						onSuccess()
					},
				})
			);
	}
	return (
		<div className="flex flex-col">
			<h2 className="font-medium">Sync</h2>
			{mnemonics.map(m => (
				<SyncMnemonic defaultMnemonic={m} updateOwner={updateOwner} />
			))}
		</div>
	);
}

function SyncMnemonic({
	defaultMnemonic,
	updateOwner
}: {
	defaultMnemonic: string
	updateOwner: (props: { mnemonic: string; onSuccess: () => void }) => void
}) {

	const [copied, setCopied] = useState(false);
	const [mode, setMode] = useState<"edit" | "view">("view");
	const [mnemonic, setMnemonic] = useState<string>(defaultMnemonic ?? "");

	function copyMnemonicToClipboard() {
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
		navigator.clipboard.writeText(mnemonic);
	}

	function toggleMode() {
		setMode((prev) => (prev === "view" ? "edit" : "view"));
	}

	if (mode == "view") {
		return (
			<div className="flex mb-1 flex-col">
				<div className="flex items-center justify-between ">
					<p className="text-sm">Mnemonics:</p>
					<div className="flex items-center ml-auto">
						<Button
							className="h-6 w-6"
							size="icon"
							variant="ghost"
							onClick={copyMnemonicToClipboard}
						>
							{copied ? <CheckIcon /> : <CopyIcon />}
						</Button>
						<Button
							className="h-6 w-6"
							size="icon"
							variant="ghost"
							onClick={toggleMode}
						>
							<Pencil2Icon />
						</Button>
					</div>
				</div>
				<div className="p-2 rounded bg-muted h-fit">
					<pre className="text-xs text-wrap h-fit">{mnemonic}</pre>
				</div>
			</div>
		)
	}

	return (

		<div>
			<div className="flex items-center justify-between">
				<p className="text-sm">Mnemonics:</p>
				<div className="flex items-center">
					<Button
						className="h-6 w-6"
						size="icon"
						variant="ghost"
						onClick={toggleMode}
					>
						<EyeOpenIcon />
					</Button>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<Textarea
					onChange={(e) => setMnemonic(e.target.value)}
					className="h-12"
				/>
				<Button
					onClick={() => updateOwner({ onSuccess: () => setMode("view"), mnemonic })}
					size="sm"
					className="h-6 ml-auto"
				>
					Update
				</Button>
			</div>
		</div>
	)

}
