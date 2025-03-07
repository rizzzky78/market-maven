import ImagePreviewer from "@/components/maven/image-previewer";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Image Previewer Demo</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">PNG Example</h2>
          <ImagePreviewer
            src="/combine-tool-workflow.svg"
            alt="Example PNG image"
            width={800}
            height={600}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">SVG Example</h2>
          <ImagePreviewer
            src="/combine-tool-workflow.svg"
            alt="Example SVG image"
            width={400}
            height={400}
          />
        </div>
      </div>
    </main>
  );
}
