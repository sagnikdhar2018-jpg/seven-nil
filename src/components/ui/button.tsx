import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "btn",
    "disabled:pointer-events-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "btn-primary",
        ink: "btn-ink",
        secondary: "btn-secondary",
        ghost: "text-muted hover:text-ink bg-transparent border-0",
      },
      size: {
        md: "h-11 min-h-11 px-5",
        lg: "h-12 min-h-12 px-6",
        xl: "h-14 min-h-14 w-full px-6",
        icon: "size-11 min-h-11 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
