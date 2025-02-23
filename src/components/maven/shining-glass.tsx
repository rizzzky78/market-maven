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
        className={`text-[#b5b5b5a4] dark:bg-clip-text bg-black inline-block text-sm ${
          disabled ? "" : "animate-shine"
        } ${className}`}
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)",
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
