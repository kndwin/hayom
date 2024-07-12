import { Timer } from "./modules/timer";
import { Todos } from "./modules/todos";
import { useHotkeys } from "./shared/hooks/use-hotkeys";
import { useHintMode, useModalActions } from "./shared/modal";
import { Shortcut } from "./shared/ui/shortcut";

function App() {
  const hintMode = useHintMode();
  const { hint, escape } = useModalActions();

  function toggleHints() {
    if (hintMode) {
      escape();
    } else {
      hint();
    }
  }
  useHotkeys([
    ["h", toggleHints],
    ["escape", escape],
    ["ctrl+c", escape],
  ]);

  return (
    <div className="min-w-screen min-h-screen bg-background relative">
      <main className="max-w-3xl mx-auto p-4 flex flex-col gap-6">
        <Timer />
        <Todos />
      </main>
      <div className=" absolute bottom-4 right-4 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">
        {`Press `}
        <Shortcut>h</Shortcut>
        {` to see hints`}
      </div>
      {hintMode && (
        <div className="absolute bottom-4 left-4 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground flex flex-col gap-1">
          <Shortcut hint="Delete todos">shift + d</Shortcut>
          <Shortcut hint="Escape">ctrl + c</Shortcut>
        </div>
      )}
    </div>
  );
}

export default App;
