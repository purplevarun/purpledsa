import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold text-primary">404</h1>
      <p className="text-muted">This page doesn&apos;t exist.</p>
      <Link href="/" className="text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
