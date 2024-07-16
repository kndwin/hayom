import { } from "@radix-ui/react-hover-card";
import { Timer } from "./modules/timer";
import { Todos } from "./modules/todos";
import { useHotkeys } from "./shared/hooks/use-hotkeys";
import { Logo } from "./shared/icons/logo";
import { useHintMode, useModalActions } from "./shared/modal";
import {
	HoverCard,
	HoverCardTrigger,
	HoverCardContent,
} from "./shared/ui/hover-card";
import { Shortcut } from "./shared/ui/shortcut";

function App() {
	const hintMode = useHintMode();
	const { toggleHint, escape } = useModalActions();

	useHotkeys([
		["h", () => toggleHint()],
		["escape", escape],
		["ctrl+c", escape],
	]);

	return (
		<div className="min-w-screen min-h-screen bg-background relative">
			<main className="max-w-3xl mx-auto p-4 flex flex-col gap-6 pb-16">
				<Timer />
				<Todos />
			</main>
			<div className="absolute bottom-4 right-4">
				<HoverCard openDelay={100} closeDelay={100}>
					<HoverCardTrigger>
						<Logo />
					</HoverCardTrigger>
					<HoverCardContent
						side="top"
						align="end"
						className="text-sm py-2 p-2 max-w-xs w-fit leading-snug flex flex-col"
					>

						<p>
							But seek first the kingdom of God and His righteousness, and all
							these things will be provided for you. Therefore don’t worry about
							tomorrow, because tomorrow will worry about itself. Each day has
							enough trouble of its own
						</p>
						<b className="text-right w-full ml-auto mt-1">Matthew 6:33-34</b>
					</HoverCardContent>
				</HoverCard>
			</div>
			<div className="absolute bottom-4 left-4 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground flex flex-col gap-1">
				{!hintMode && <Shortcut hint="Show hints">h</Shortcut>}
				{hintMode && (
					<>
						<Shortcut hint="Delete todos">shift + d</Shortcut>
						<Shortcut hint="Escape">ctrl + c</Shortcut>
						<Shortcut hint="Hide hints">h</Shortcut>
					</>
				)}
			</div>
		</div>
	);
}

export default App;
