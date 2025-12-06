import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">Hello, World!</h1>
        <p className="mt-4 text-lg">
          <Link href="/about" className="text-blue-500 underline">
            Go to About Page
          </Link>
        </p>
      </div>
    </div>
  );
}