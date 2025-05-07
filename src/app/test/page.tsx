import { StaggerText } from "@/components/ui/stagger-text";

export default function Page() {
  return (
    <div className="bg-black h-[300vh] w-full flex justify-center items-end">
      <div className="w-full max-w-5xl">
        <StaggerText animateOnScroll>
          <p className="text-white text-4xl">
            All files shared through CodegridPRO are fully original and coded
            entirely from scratch. While some layout/design elements (not the
            code) may draw inspiration from notable websites to provide
            educational value, every line of code is written manually and not
            taken from any other source. These resources are crafted
            specifically for this membership, ensuring you won’t find them
            anywhere else.
          </p>
        </StaggerText>
      </div>
    </div>
  );
}
