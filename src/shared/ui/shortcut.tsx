import { cn } from "./util";

const Shortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "text-[11px] text-primary-foreground bg-primary px-1 py-0.5 leading-none rounded tabular-nums",
        className
      )}
      {...props}
    />
  );
};
Shortcut.displayName = "Shortcut";

export { Shortcut };
