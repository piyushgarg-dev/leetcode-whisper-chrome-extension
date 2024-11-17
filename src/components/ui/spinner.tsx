import React from "react";
import { cn } from "@/lib/utils";

type SpinnerProps = React.ComponentPropsWithoutRef<"div"> & {
  
  className?: string;
  
  size?: number;
};


const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => {
    
    const computeDelay = (i: number): string => `${-1.2 + i * 0.1}s`;

    
    const computeRotation = (i: number): string => `${i * 30}deg`;

    return (
      <div
        className={cn(``, className)}
        role="status"
        aria-label="Loading"
        ref={ref}
        style={{
          width: `${size ? size : "20"}px`,
          height: `${size ? size : "20"}px`,
        }}
        {...props}
      >
        <div className="relative left-1/2 top-1/2 size-full">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute left-[-10%] top-[-3.9%] h-[8%] w-[24%] animate-spinner rounded-md bg-foreground"
              style={{
                animationDelay: computeDelay(i),
                transform: `rotate(${computeRotation(i)}) translate(146%)`,
              }}
            />
          ))}
        </div>
      </div>
    );
  },
);

Spinner.displayName = "Spinner";

export { Spinner };
