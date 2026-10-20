import { FC } from "react";

interface AnimationProps {
  /** Text content */
  text: string;
  /** Disable animation? */
  disabled?: boolean;
  /** Animation speed, lower the value means fater the animation speed */
  speed?: number;
  className?: string;
}

export const LoadingText: FC<AnimationProps> = ({
  text,
  disabled = false,
  speed = 1,
  className = "",
}) => {
  const animationDuration = `${speed}s`;

  return (
    <div className="px-5">
      <div
        className={`inline-block bg-clip-text text-sm text-transparent ${
          disabled ? "" : "animate-shine"
        } ${className}`}
        style={{
          backgroundImage:
            "linear-gradient(120deg, hsl(var(--muted-foreground)) 40%, hsl(var(--foreground)) 50%, hsl(var(--muted-foreground)) 60%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          animationDuration: animationDuration,
        }}
      >
        <span>{text}</span>
      </div>
    </div>
  );
};
