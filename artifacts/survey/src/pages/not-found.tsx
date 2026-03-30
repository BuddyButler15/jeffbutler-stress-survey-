import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <main className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h1 className="section-title">404 — Page Not Found</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          The page you are looking for does not exist.
        </p>
        <Link href="/" className="btn btn-primary">
          Go Home
        </Link>
      </main>
    </div>
  );
}
