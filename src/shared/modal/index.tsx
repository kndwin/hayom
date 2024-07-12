import { createStore } from "@xstate/store";
import { useSelector } from "@xstate/store/react";

const modalStore = createStore(
  { modal: "idle" as "idle" | "focused", hint: false },
  {
    MODAL_FOCUS: { modal: "focused" },
    MODAL_ESCAPE: { modal: "idle" },
    TOGGLE_HINT: (prev) => ({ hint: !prev.hint }),
  }
);

export const useModal = () => {
  const modal = useSelector(modalStore, (s) => s.context.modal);
  return modal;
};

export const useHintMode = () => {
  const hintMode = useSelector(modalStore, (s) => s.context.hint);
  return hintMode;
};

export const useModalActions = () => {
  const send = modalStore.send;
  return {
    focus: () => send({ type: "MODAL_FOCUS" }),
    escape: () => send({ type: "MODAL_ESCAPE" }),
    toggleHint: () => send({ type: "TOGGLE_HINT" }),
  };
};
