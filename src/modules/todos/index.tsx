import * as S from "@effect/schema/Schema";
import { Progress } from "@/shared/ui/progress";
import {
	ValueNoneIcon,
	SewingPinIcon,
	SewingPinFilledIcon,
} from "@radix-ui/react-icons";
import * as E from "effect";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cast, NonEmptyString1000 } from "@evolu/react";

import { Textarea } from "@/shared/ui/textarea";
import { useHotkeys } from "@/shared/hooks/use-hotkeys";
import { Checkbox } from "@/shared/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import {
	AlertDialog,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogAction,
	AlertDialogFooter,
} from "@/shared/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Label } from "@/shared/ui/label";
import {
	Tooltip,
	TooltipArrow,
	tooltipCn,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/tooltip";
import { useHintMode, useModal } from "@/shared/modal";
import { Shortcut } from "@/shared/ui/shortcut";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";

import { useAllTodos, useTodoActions } from "./db";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/ui/util";

export function Todos() {
	const modal = useModal();
	const hintMode = useHintMode();
	const todos = useAllTodos();
	const completedTodos = todos.filter((todo) => todo.isCompleted);
	const completedFocusedTodos = completedTodos.filter(
		(t) => t.isFocused && t.isCompleted
	);

	const [viewListMode, setViewListMode] = useState<"default" | "completedLast">(
		"default"
	);

	function sortTodoList(a: (typeof todos)[number]) {
		if (viewListMode === "completedLast") {
			return a.isCompleted ? 1 : -1;
		}
		return 1;
	}
	const collatedTodos = todos.map((t) => t).sort(sortTodoList);
	const focusedTodos = todos
		.filter((todo) => todo.isFocused)
		.sort(sortTodoList);

	const progressInPercentage = {
		all: (completedTodos.length / todos.length) * 100,
		focused: (completedFocusedTodos.length / focusedTodos.length) * 100,
	};

	const [tab, setTab] = useState<"all" | "focused">("all");
	const [openDeleteAll, setOpenDeleteAll] = useState(false);

	function toggleViewListMode() {
		setViewListMode((prev) =>
			prev === "default" ? "completedLast" : "default"
		);
	}

	function switchTabs() {
		setTab((prev) => (prev === "all" ? "focused" : "all"));
	}
	function deleteAll() {
		setOpenDeleteAll(true);
	}

	useEffect(() => {
		if (modal === "focused") {
			setTab("focused");
		}
	}, [modal]);

	useHotkeys([
		["t", switchTabs],
		["shift+d", deleteAll],
		["v", toggleViewListMode],
	]);

	return (
		<Tabs value={tab} className="flex flex-col">
			<div className="pb-2 flex items-center justify-between">
				<h1 className="text-xl font-bold">Todo</h1>
				<div className="flex items-center gap-1">
					<Tooltip open={hintMode}>
						<TooltipTrigger tabIndex={-1}>
							<Button
								size="icon"
								variant={viewListMode === "completedLast" ? "default" : "ghost"}
								onClick={toggleViewListMode}
								className="h-8 w-8"
							>
								{viewListMode === "default" && (
									<SewingPinIcon className="w-4 h-4" />
								)}
								{viewListMode === "completedLast" && (
									<SewingPinFilledIcon className="rotate-180 w-4 h-4" />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<TooltipArrow />
							<Shortcut
								hint={
									viewListMode === "default"
										? "Switch to move completed last"
										: "Switch to default"
								}
							>
								v
							</Shortcut>
						</TooltipContent>
					</Tooltip>
					<Tooltip open={hintMode}>
						<TooltipTrigger tabIndex={-1}>
							<TabsList tabIndex={-1} defaultValue="all">
								<TabsTrigger tabIndex={-1} value="all">
									All
								</TabsTrigger>
								<TabsTrigger tabIndex={-1} value="focused">
									Focused
								</TabsTrigger>
							</TabsList>
						</TooltipTrigger>
						<TooltipContent side="top">
							<TooltipArrow />
							<Shortcut
								hint={`Switch to ${tab === "all" ? "focused" : "all"} todos`}
							>
								t
							</Shortcut>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<div className="flex flex-col gap-3">
				<Progress
					value={
						tab === "all"
							? progressInPercentage.all
							: progressInPercentage.focused
					}
				/>
				<AddTodo />
				<TabsContent className="mt-0" tabIndex={-1} value="all">
					<TodoList key={`all`} todos={collatedTodos} />
				</TabsContent>
				<TabsContent className="mt-0" tabIndex={-1} value="focused">
					<TodoList key={`focused`} todos={focusedTodos} />
				</TabsContent>
			</div>
			<AlertDialogDeleteTodo
				todos={todos}
				open={openDeleteAll}
				onOpenChange={setOpenDeleteAll}
			/>
		</Tabs>
	);
}

type DeleteCategories = "all" | "completed";
function AlertDialogDeleteTodo(props: {
	todos: ReturnType<typeof useAllTodos>;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [type, setType] = useState<DeleteCategories>("completed");
	const { remove } = useTodoActions();
	const completedTodos = props.todos.filter((todo) => todo.isCompleted);
	async function deleteAll() {
		if (type === "completed") {
			await Promise.allSettled(
				completedTodos
					.filter((t) => t.isCompleted)
					.map((t) => {
						remove(t.id);
					})
			);
		} else if (type === "all") {
			await Promise.allSettled(
				props.todos.map((t) => {
					remove(t.id);
				})
			);
		}
		props.onOpenChange(false);
	}

	return (
		<AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you sure you want to delete {type} todos?
					</AlertDialogTitle>
					{props.todos
						.filter(({ isCompleted }) =>
							type === "completed" ? isCompleted : true
						)
						.map((t) => (
							<li
								key={t.id}
								className="text-sm leading-none text-muted-foreground"
							>
								{t.title}
							</li>
						))}
				</AlertDialogHeader>
				<RadioGroup
					value={type}
					onValueChange={(value) => setType(value as DeleteCategories)}
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="completed" id="completed" />
						<Label htmlFor="completed">Completed</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="all" id="all" />
						<Label htmlFor="all">All</Label>
					</div>
				</RadioGroup>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => props.onOpenChange(false)}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction onClick={deleteAll}>Delete all</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function AddTodo() {
	const hintMode = useHintMode();
	const modal = useModal();
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [withFocused, setWithFocused] = useState(false);
	const [active, setActive] = useState(false);
	const { create } = useTodoActions();

	function handleTextareaKeypress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		const supportedKeys = ["Enter"] as const;
		const key = e.key as (typeof supportedKeys)[number]; // type cast and fail it out
		const match = E.Match.type<typeof key>().pipe(
			E.Match.when("Enter", () => createTodo(e.currentTarget.value)),
			E.Match.exhaustive
		);

		if (supportedKeys.includes(key)) {
			e.preventDefault();
			match(key);
			e.currentTarget.value = "";
		}
	}

	function createTodo(title: string) {
		const parseTitle = S.decodeUnknownEither(NonEmptyString1000)(title);

		if (parseTitle._op === "Right") {
			create({
				title: parseTitle.right,
				isCompleted: cast(false),
				isFocused: cast(withFocused),
			});
		}
	}

	function executeIfActive(fn: () => void) {
		if (active) {
			fn();
		}
	}

	function toggleWithFocus() {
		setWithFocused((prev) => !prev);
	}

	useHotkeys([["c", () => textareaRef.current?.focus()]]);
	useHotkeys(
		[
			["ctrl+c", () => textareaRef.current?.blur()],
			["ctrl+f", () => executeIfActive(toggleWithFocus)],
		],
		[]
	);

	return (
		<div className="flex items-center gap-2">
			<Tooltip open={hintMode}>
				<TooltipTrigger asChild>
					<Textarea
						disabled={modal === "focused"}
						className="text-sm py-1"
						tabIndex={-1}
						onKeyDown={handleTextareaKeypress}
						ref={textareaRef}
						placeholder="What needs to be done?"
						onFocus={() => setActive(true)}
						onBlur={() => setActive(false)}
					/>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<TooltipArrow />
					<div className="flex flex-col gap-1">
						{!active && <Shortcut hint="Create new todo">c</Shortcut>}
						{active && <Shortcut hint="Escape">ctrl+c</Shortcut>}
					</div>
				</TooltipContent>
			</Tooltip>
			<Tooltip open={hintMode && active}>
				<TooltipTrigger className="h-4" tabIndex={-1}>
					<Switch
						disabled={modal === "focused"}
						checked={withFocused}
						onCheckedChange={setWithFocused}
					/>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<TooltipArrow />
					<Shortcut hint={withFocused ? "without focus" : "with focus"}>
						ctrl + f
					</Shortcut>
				</TooltipContent>
			</Tooltip>
		</div>
	);
}

function EmptyTodo() {
	return (
		<div className="bg-background rounded-xl border w-full p-4 items-center flex flex-col">
			<ValueNoneIcon className="w-10 h-10" />
			<p className="font-bold mt-4 mb-2">Empty list</p>
		</div>
	);
}

function useFocusNavigation() {
	const refs = useRef<(HTMLAnchorElement | null)[]>([]);

	const moveUp = () => {
		const activeRefs = refs.current.filter(Boolean);
		const currentIndex = activeRefs.findIndex((el) =>
			el?.contains(document.activeElement)
		);
		if (currentIndex == -1) {
			activeRefs[activeRefs.length - 1]?.focus();
		} else if (currentIndex >= 0) {
			activeRefs[currentIndex - 1]?.focus();
		}
	};

	const moveDown = () => {
		const activeRefs = refs.current.filter(Boolean);
		const currentIndex = activeRefs.findIndex((el) =>
			el?.contains(document.activeElement)
		);
		if (currentIndex == -1) {
			activeRefs[0]?.focus();
		} else if (currentIndex < activeRefs.length - 1) {
			activeRefs[currentIndex + 1]?.focus();
		}
	};

	useHotkeys([
		["j", moveDown],
		["k", moveUp],
	]);

	return { refs };
}

function TodoList({ todos }: { todos: ReturnType<typeof useAllTodos> }) {
	const { refs } = useFocusNavigation();
	return (
		<div
			tabIndex={-1}
			className="flex items-center justify-between flex-col gap-2 outline-border"
		>
			{E.Array.match(todos, {
				onEmpty: () => <EmptyTodo />,
				onNonEmpty: (todos) =>
					todos.map((todo, index) => (
						<TodoItem
							index={index}
							key={`${todo.id}`}
							todo={todo}
							ref={(element) => (refs.current[index] = element)}
							focus={() => refs.current[index]?.focus()}
						/>
					)),
			})}
		</div>
	);
}

const TodoItem = forwardRef<
	HTMLAnchorElement,
	{
		todo: ReturnType<typeof useAllTodos>[number];
		index: number;
		focus: () => void;
	}
>(({ todo, index, focus }, ref) => {
	const [active, setActive] = useState(false);
	const { remove, update } = useTodoActions();
	const [mode, setMode] = useState<"view" | "edit">("view");
	const hintMode = useHintMode();

	function executeIfActive(fn: () => void) {
		if (active) {
			fn();
		}
	}

	function removeTodo() {
		remove(todo.id);
	}

	function toggleViewEdit() {
		setMode(mode === "view" ? "edit" : "view");
	}

	function toggleCompleted() {
		update({
			id: todo.id,
			isCompleted: cast(!todo.isCompleted),
		});
	}

	function updateFocus() {
		update({
			id: todo.id,
			isFocused: cast(!todo.isFocused),
		});
	}

	function handleTextareaKeypress(e: React.KeyboardEvent<HTMLInputElement>) {
		const supportedKeys = ["Enter"] as const;
		const key = e.key as (typeof supportedKeys)[number]; // type cast and fail it out
		const match = E.Match.type<typeof key>().pipe(
			E.Match.when("Enter", () => {
				const parseTitle = S.decodeUnknownEither(NonEmptyString1000)(
					e.currentTarget.value
				);
				if (parseTitle._op === "Right") {
					const title = parseTitle.right;
					update({ id: todo.id, title });
					toggleViewEdit();
				}
			}),
			E.Match.exhaustive
		);

		if (supportedKeys.includes(key)) {
			e.preventDefault();
			match(key);
		}
	}

	useHotkeys([
		["d", () => executeIfActive(removeTodo)],
		["x", () => executeIfActive(toggleCompleted)],
		["f", () => executeIfActive(updateFocus)],
		["e", () => executeIfActive(toggleViewEdit)],
		[`${index}`, () => focus()],
	]);

	useHotkeys(
		[
			[
				"ctrl+c",
				() =>
					executeIfActive(() => {
						setMode("view");
					}),
			],
		],
		[]
	);

	return (
		<a
			ref={ref}
			href={`#todo-${todo.id}`}
			key={todo.id}
			onFocus={() => setActive(true)}
			onBlur={() => setActive(false)}
			onClick={() => {
				toggleCompleted();
			}}
			className="w-full py-1 flex items-center justify-start gap-2 focus:bg-muted focus:outline-none rounded px-2 focus-within:bg-muted"
		>
			<Tooltip open={hintMode}>
				<TooltipTrigger />
				<TooltipContent
					side="left"
					sideOffset={0}
					className={cn(tooltipCn, "w-fit px-2 pt-0 pb-0 items-center h-fit")}
				>
					<TooltipArrow />
					<Shortcut>{index}</Shortcut>
				</TooltipContent>
			</Tooltip>
			<Tooltip open={hintMode && active}>
				<div className="flex flex-col">
					<Checkbox
						onCheckedChange={toggleCompleted}
						tabIndex={-1}
						checked={!!todo.isCompleted}
					/>
					<TooltipTrigger></TooltipTrigger>
				</div>
				<TooltipContent side="bottom">
					<TooltipArrow />
					<Shortcut hint={todo.isCompleted ? "Revert" : "Complete"}>x</Shortcut>
				</TooltipContent>
			</Tooltip>
			{mode === "view" && (
				<Tooltip open={hintMode && active}>
					<TooltipTrigger asChild>
						<span
							className={cn(
								"text-sm w-full",
								todo.isCompleted && "line-through text-muted-foreground"
							)}
						>
							{todo.title}
						</span>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<TooltipArrow />
						<div className="flex flex-col gap-1 items-start">
							<Shortcut hint="Edit">e</Shortcut>
							<Shortcut hint="Delete">d</Shortcut>
						</div>
					</TooltipContent>
				</Tooltip>
			)}
			{mode === "edit" && (
				<Tooltip open={hintMode && active}>
					<TooltipTrigger asChild>
						<Input
							autoFocus
							className="h-6 text-sm px-1 rounded"
							onBlur={toggleViewEdit}
							onKeyDown={handleTextareaKeypress}
							type="text"
							defaultValue={todo.title ?? ""}
						/>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<TooltipArrow />
						<div>
							<Shortcut hint="Escape">ctrl+c</Shortcut>
						</div>
					</TooltipContent>
				</Tooltip>
			)}
			<Tooltip open={hintMode && active && mode === "view"}>
				<TooltipTrigger className="text-muted-foreground">
					{todo.isFocused ? (
						<div
							className={cn(
								"w-3 h-3 rounded-full",
								todo.isCompleted
									? "bg-muted-foreground"
									: "border-muted-foreground border-2"
							)}
						/>
					) : null}
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<TooltipArrow />
					<Shortcut hint={todo.isFocused ? "Unfocus" : "Focus"}>f</Shortcut>
				</TooltipContent>
			</Tooltip>
		</a>
	);
});
