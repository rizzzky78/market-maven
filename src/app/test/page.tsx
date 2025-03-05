import VideoPlayer from "@/components/maven/video-player";

export default function Page() {
  return (
    <div className="flex items-center justify-center">
      <div className="max-w-xl">
        <VideoPlayer url="/vid/v0-recommendator.webm" />
      </div>
    </div>
  );
}
