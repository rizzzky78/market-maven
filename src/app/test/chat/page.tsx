import { LoadingText } from "@/components/maven/shining-glass";

export default function Page() {
  return (
    <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4">
      <LoadingText text="Helo World from another world!" />
    </div>
  );
}
