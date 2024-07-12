import { cn } from "./util";

const shortcutCn =
  "text-[11px] text-primary-foreground bg-primary-foreground/15 px-1 py-0.5 leading-none rounded";

const Shortcut = ({
  className,
  hint,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  hint?: string;
}) => {
  if (hint) {
    return (
      <div className="flex items-center gap-1">
        <kbd className={cn(shortcutCn, className)} {...props}>
          {children}
        </kbd>
        <span className="text-xs">{hint}</span>
      </div>
    );
  }
  return (
    <kbd className={cn(shortcutCn, className)} {...props}>
      {children}
    </kbd>
  );
};
Shortcut.displayName = "Shortcut";

export { Shortcut };
