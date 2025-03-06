export default async function Page() {
  const data = await fetch("/api/ratings");
  const res = await data.json();

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-xl">
        <pre>{JSON.stringify(res, null, 2)}</pre>
      </div>
    </div>
  );
}
