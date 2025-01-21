import { ShinyText } from "@/components/maven/shining-glass";
import { UserInquiry } from "@/components/maven/user-inquiry";

export default function Home() {
  return (
    <div className="flex justify-center items-center">
      <div className="my-20 max-w-2xl w-full">
        {/* <div className="h-[360px] w-full bg-red-300 flex items-center justify-center rounded-3xl">
          <div className="loader">
            <svg viewBox="0 0 80 80">
              <circle r="32" cy="40" cx="40" id="test"></circle>
            </svg>
          </div>

          <div className="loader triangle">
            <svg viewBox="0 0 86 80">
              <polygon points="43 8 79 72 7 72"></polygon>
            </svg>
          </div>

          <div className="loader">
            <svg viewBox="0 0 80 80">
              <rect height="64" width="64" y="8" x="8"></rect>
            </svg>
          </div>
        </div> */}
        {/* <ShinyText
          text="Loading Content..."
          speed={1}
          className=" font-semibold"
        /> */}
        <UserInquiry inquiry={inquiry} />
        <UserInquiry inquiry={multipleSelectionInquiry} />
      </div>
    </div>
  );
}

const inquiry = {
  question: "What is your preferred contact method?",
  options: [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "sms", label: "SMS" },
  ],
  allowsInput: true,
  inputLabel: "Specify your contact details",
  inputPlaceholder: "e.g., your@email.com or phone number",
  type: "single" as const,
};

const multipleSelectionInquiry = {
  question: "Which programming languages do you know?",
  options: [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "ruby", label: "Ruby" },
  ],
  allowsInput: true,
  inputLabel: "Any other languages?",
  inputPlaceholder: "e.g., Go, Rust, etc.",
  type: "multiple" as const,
};
