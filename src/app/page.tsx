export default function Home() {
  return (
    <div className="flex justify-center items-center">
      <div className="my-20 max-w-3xl w-full">
        <div className="h-[360px] w-full bg-red-300 flex items-center justify-center rounded-3xl">
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
        </div>
      </div>
    </div>
  );
}
