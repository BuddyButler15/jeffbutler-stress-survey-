import { Link } from "wouter";

export default function Home() {
  return (
    <div className="page-wrapper">
      <main className="container content-center">
        <div className="hero">
          <h1 className="hero-title">Undergraduate Business Student Survey</h1>
          <p className="hero-subtitle">
            This short survey collects information about your lifestyle and academic background.
            It takes less than 2 minutes to complete. All responses are anonymous and will only
            be shown as aggregated results.
          </p>
          <div className="button-group">
            <Link href="/survey" className="btn btn-primary">
              Take the Survey
            </Link>
            <Link href="/results" className="btn btn-outline">
              View Results
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
