import { Timer } from "./modules/timer";
import { Todos } from "./modules/todos";
import { useHotkeys } from "./shared/hooks/use-hotkeys";
import { useModal, useModalActions } from "./shared/modal";
import { Shortcut } from "./shared/ui/shortcut";

function App() {
  const modal = useModal();
  const { hint, escape } = useModalActions();
  function toggleHints() {
    if (modal === "hint") {
      escape();
    } else if (modal === "idle") {
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
      {modal === "hint" && (
        <div className="absolute bottom-4 left-4 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground flex flex-col gap-1">
          <div>
            <Shortcut>shift + d</Shortcut>
            Delete todos
          </div>
          <div>
            <Shortcut>ctrl + c</Shortcut>
            Escape
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
