import * as S from "@effect/schema/Schema";
import { Progress } from "@/shared/ui/progress";
import {
  CircleIcon,
  ValueNoneIcon,
  SewingPinIcon,
  SewingPinFilledIcon,
} from "@radix-ui/react-icons";
import * as E from "effect";
import { forwardRef, useRef, useState } from "react";
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
import { useModal } from "@/shared/modal";
import { Shortcut } from "@/shared/ui/shortcut";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";

import { useAllTodos, useTodoActions } from "./db";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/ui/util";

export function Todos() {
  const todos = useAllTodos();
  const completedTodos = todos.filter((todo) => todo.isCompleted);

  const [viewListMode, setViewListMode] = useState<"default" | "completedLast">(
    "default"
  );

  function sortTodoList(a: (typeof todos)[number], b: (typeof todos)[number]) {
    // need to use for typescript
    console.log({ b });
    if (viewListMode === "completedLast") {
      return a.isCompleted ? 1 : -1;
    }
    return 1;
  }
  const collatedTodos = todos.map((t) => t).sort(sortTodoList);
  const focusedTodos = todos
    .filter((todo) => todo.isFocused)
    .sort(sortTodoList);

  const progressInPercentage = (completedTodos.length / todos.length) * 100;
  const modal = useModal();

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
          <Tooltip open={modal === "hint"}>
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
              <Shortcut>v</Shortcut>
              <span className="ml-3">
                Toggle view to
                {viewListMode === "default" ? "completed last" : "default"}
              </span>
            </TooltipContent>
          </Tooltip>
          <Tooltip open={modal === "hint"}>
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
              <Shortcut>t</Shortcut>
              <span className="ml-3">
                Switch to {tab === "all" ? "focused" : "all"} todos
              </span>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Progress value={progressInPercentage} />
        <AddTodo />
        <TabsContent tabIndex={-1} value="all">
          <TodoList todos={collatedTodos} />
        </TabsContent>
        <TabsContent tabIndex={-1} value="focused">
          <TodoList todos={focusedTodos} />
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
              <li className="text-sm leading-none text-muted-foreground">
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
    <div className="flex items-center gap-1">
      <Tooltip open={modal === "hint"}>
        <TooltipTrigger asChild>
          <Textarea
            tabIndex={-1}
            onKeyPress={handleTextareaKeypress}
            ref={textareaRef}
            placeholder="What needs to be done?"
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
          />
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <TooltipArrow />
          <div className="flex flex-col gap-1">
            {!active && (
              <div>
                <Shortcut>c</Shortcut>
                <span className="ml-3">Create new todo</span>
              </div>
            )}
            {active && (
              <div>
                <Shortcut>ctrl+c</Shortcut>
                <span className="ml-3">Escape new todo</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
      <Tooltip open={modal === "hint" && active}>
        <TooltipTrigger tabIndex={-1}>
          <Switch checked={withFocused} onCheckedChange={setWithFocused} />
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <TooltipArrow />
          <Shortcut>ctrl + f</Shortcut>
          <span className="ml-3">
            {withFocused ? "without focus" : "with focus"}
          </span>
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
              key={todo.id}
              todo={todo}
              ref={(element) => (refs.current[index] = element)}
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
  }
>(({ todo, index }, ref) => {
  const [active, setActive] = useState(false);
  const { remove, update } = useTodoActions();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const modal = useModal();
  const inputRef = useRef<HTMLInputElement>(null);

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
    inputRef.current?.focus();
  }

  function toggleCompleted() {
    update({
      id: todo.id,
      isCompleted: cast(!todo.isCompleted),
    });
  }

  function focus() {
    update({
      id: todo.id,
      isFocused: cast(!todo.isFocused),
    });
  }

  useHotkeys([
    ["d", () => executeIfActive(removeTodo)],
    ["x", () => executeIfActive(toggleCompleted)],
    ["f", () => executeIfActive(focus)],
    ["e", () => executeIfActive(toggleViewEdit)],
    [`${index}`, toggleCompleted],
  ]);

  return (
    <a
      ref={ref}
      href={`#todo-${todo.id}`}
      key={todo.id}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className="w-full py-1 flex items-center justify-start gap-2 focus:bg-muted focus:outline-none rounded px-2"
    >
      <Tooltip open={modal === "hint"}>
        <TooltipTrigger asChild>
          <div>{modal === "hint" && <Shortcut>{index}</Shortcut>}</div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className={cn(tooltipCn, "w-fit px-2 pt-0 pb-0 items-center h-fit")}
        >
          <TooltipArrow />
          <Shortcut>{index}</Shortcut>
          <span className="ml-3 text-xs leading-none">Check</span>
        </TooltipContent>
      </Tooltip>
      <Tooltip open={modal === "hint" && active}>
        <div className="flex flex-col">
          <Checkbox
            onCheckedChange={toggleCompleted}
            tabIndex={-1}
            checked={!!todo.isCompleted}
          />
          <TooltipTrigger></TooltipTrigger>
        </div>
        <TooltipContent side="bottom">
          <Shortcut>x</Shortcut>
          <TooltipArrow />
          <span className="ml-3">
            {todo.isCompleted ? "Revert" : "Complete"}
            {" todo"}
          </span>
        </TooltipContent>
      </Tooltip>
      {mode === "view" && (
        <Tooltip open={modal === "hint" && active}>
          <TooltipTrigger asChild>
            <span className="text-sm w-full">{todo.title}</span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <TooltipArrow />
            <div className="flex flex-col gap-1 items-start">
              <div className="flex">
                <Shortcut>e</Shortcut>
                <span className="ml-3">Edit</span>
              </div>
              <div className="flex">
                <Shortcut>d</Shortcut>
                <span className="ml-3">Remove</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
      {mode === "edit" && (
        <Input
          ref={inputRef}
          autoFocus
          className="h-6 text-sm px-1 rounded"
          onBlur={toggleViewEdit}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const parseTitle = S.decodeUnknownEither(NonEmptyString1000)(
                e.currentTarget.value
              );

              if (parseTitle._op === "Right") {
                const title = parseTitle.right;
                update({ id: todo.id, title });
                toggleViewEdit();
              }
            }
          }}
          type="text"
          defaultValue={todo.title ?? ""}
        />
      )}
      <Tooltip open={modal === "hint" && active}>
        <TooltipTrigger asChild>
          {todo.isFocused ? (
            <CircleIcon className="w-4 h-4 stroke-muted-foreground" />
          ) : null}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <Shortcut>f</Shortcut>
          <TooltipArrow />
          <span className="ml-3">
            {todo.isFocused ? "Unfocus" : "Focus"}
            {" todo"}
          </span>
        </TooltipContent>
      </Tooltip>
    </a>
  );
});
