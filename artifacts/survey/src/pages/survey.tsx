import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { supabase, type SurveyResponse } from "@/lib/supabase";

const SLEEP_OPTIONS = [
  "Less than 5 hours",
  "5–6 hours",
  "6–7 hours",
  "7–8 hours",
  "8–9 hours",
  "9 or more hours",
];

const STRESS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const MAJOR_OPTIONS = ["Business", "Engineering", "Nursing", "Pre-Med", "Psych", "Other"];

type FormErrors = {
  exercise?: string;
  sleep_hours?: string;
  stress_level?: string;
  majors?: string;
  other_major?: string;
};

type SubmittedData = {
  exercise: string;
  sleep_hours: string;
  stress_level: number;
  major: string[];
  other_major: string;
};

export default function Survey() {
  const [exercise, setExercise] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [majors, setMajors] = useState<string[]>([]);
  const [otherMajor, setOtherMajor] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);

  const exerciseRef = useRef<HTMLInputElement>(null);
  const otherMajorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    exerciseRef.current?.focus();
  }, []);

  const otherChecked = majors.includes("Other");

  useEffect(() => {
    if (otherChecked) {
      otherMajorRef.current?.focus();
    }
  }, [otherChecked]);

  function handleMajorChange(major: string, checked: boolean) {
    setMajors((prev) =>
      checked ? [...prev, major] : prev.filter((m) => m !== major)
    );
    if (!checked && major === "Other") {
      setOtherMajor("");
    }
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!exercise.trim()) errs.exercise = "Please answer this question.";
    if (!sleepHours) errs.sleep_hours = "Please select an option.";
    if (stressLevel === null) errs.stress_level = "Please select a stress level.";
    if (majors.length === 0) errs.majors = "Please select at least one major.";
    if (otherChecked && !otherMajor.trim())
      errs.other_major = "Please describe your other major.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError("");

    const payload: SurveyResponse = {
      exercise: exercise.trim(),
      sleep_hours: sleepHours,
      stress_level: stressLevel!,
      major: majors,
      other_major: otherChecked ? otherMajor.trim() : null,
    };

    const { error } = await supabase.from("survey_responses").insert([payload]);

    setSubmitting(false);

    if (error) {
      setSubmitError("Something went wrong saving your response. Please try again.");
      return;
    }

    setSubmittedData({
      exercise: payload.exercise,
      sleep_hours: payload.sleep_hours,
      stress_level: payload.stress_level,
      major: payload.major,
      other_major: payload.other_major ?? "",
    });
    setSubmitted(true);
  }

  if (submitted && submittedData) {
    return (
      <div className="page-wrapper">
        <main className="container">
          <div className="card thankyou-card">
            <h1 className="section-title">Thank you!</h1>
            <p className="thankyou-message">Your response has been recorded.</p>
            <div className="summary">
              <h2 className="summary-heading">Your answers</h2>
              <dl className="summary-list">
                <div className="summary-row">
                  <dt>Do you exercise?</dt>
                  <dd>{submittedData.exercise}</dd>
                </div>
                <div className="summary-row">
                  <dt>Hours of sleep</dt>
                  <dd>{submittedData.sleep_hours}</dd>
                </div>
                <div className="summary-row">
                  <dt>Stress level</dt>
                  <dd>{submittedData.stress_level} / 10</dd>
                </div>
                <div className="summary-row">
                  <dt>Major(s)</dt>
                  <dd>
                    {submittedData.major
                      .map((m) =>
                        m === "Other" && submittedData.other_major
                          ? submittedData.other_major
                          : m
                      )
                      .join(", ")}
                  </dd>
                </div>
              </dl>
            </div>
            <Link href="/results" className="btn btn-primary">
              View Results
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <header className="survey-header">
        <span className="survey-header-title">Student Survey</span>
        <Link href="/results" className="header-link">
          View Results
        </Link>
      </header>

      <main className="container">
        <h1 className="section-title">Tell us about yourself</h1>

        {submitError && (
          <div className="error-banner" role="alert">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="survey-form">
          {/* Q1: Exercise */}
          <div className="form-group">
            <label htmlFor="exercise" className="form-label">
              1. Do you exercise?
            </label>
            <input
              id="exercise"
              type="text"
              className={`form-input${errors.exercise ? " input-error" : ""}`}
              placeholder="Y/N"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              ref={exerciseRef}
              aria-required="true"
              aria-describedby={errors.exercise ? "exercise-error" : undefined}
            />
            {errors.exercise && (
              <span id="exercise-error" className="field-error" role="alert">
                {errors.exercise}
              </span>
            )}
          </div>

          {/* Q2: Sleep */}
          <div className="form-group">
            <label htmlFor="sleep_hours" className="form-label">
              2. How many hours of sleep do you get?
            </label>
            <select
              id="sleep_hours"
              className={`form-select${errors.sleep_hours ? " input-error" : ""}`}
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              aria-required="true"
              aria-describedby={errors.sleep_hours ? "sleep-error" : undefined}
            >
              <option value="">— Select an option —</option>
              {SLEEP_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.sleep_hours && (
              <span id="sleep-error" className="field-error" role="alert">
                {errors.sleep_hours}
              </span>
            )}
          </div>

          {/* Q3: Stress */}
          <fieldset className="form-group">
            <legend className="form-label">
              3. What are your stress levels? (1 = very low, 10 = very high)
            </legend>
            <div
              className={`radio-grid${errors.stress_level ? " input-error-group" : ""}`}
              aria-describedby={errors.stress_level ? "stress-error" : undefined}
            >
              {STRESS_OPTIONS.map((n) => (
                <label key={n} className="radio-label">
                  <input
                    type="radio"
                    name="stress_level"
                    value={n}
                    checked={stressLevel === n}
                    onChange={() => setStressLevel(n)}
                    className="radio-input"
                    aria-label={`Stress level ${n}`}
                  />
                  <span className="radio-text">{n}</span>
                </label>
              ))}
            </div>
            {errors.stress_level && (
              <span id="stress-error" className="field-error" role="alert">
                {errors.stress_level}
              </span>
            )}
          </fieldset>

          {/* Q4: Major */}
          <fieldset className="form-group">
            <legend className="form-label">
              4. What is your major? (select all that apply)
            </legend>
            <div
              className={`checkbox-group${errors.majors ? " input-error-group" : ""}`}
              aria-describedby={errors.majors ? "majors-error" : undefined}
            >
              {MAJOR_OPTIONS.map((major) => (
                <label key={major} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={major}
                    checked={majors.includes(major)}
                    onChange={(e) => handleMajorChange(major, e.target.checked)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">{major}</span>
                </label>
              ))}
            </div>
            {errors.majors && (
              <span id="majors-error" className="field-error" role="alert">
                {errors.majors}
              </span>
            )}

            {otherChecked && (
              <div className="form-group form-group-nested">
                <label htmlFor="other_major" className="form-label">
                  Please describe your other major:
                </label>
                <input
                  id="other_major"
                  type="text"
                  className={`form-input${errors.other_major ? " input-error" : ""}`}
                  placeholder="e.g. Computer Science"
                  value={otherMajor}
                  onChange={(e) => setOtherMajor(e.target.value)}
                  ref={otherMajorRef}
                  aria-required="true"
                  aria-describedby={errors.other_major ? "other-major-error" : undefined}
                />
                {errors.other_major && (
                  <span id="other-major-error" className="field-error" role="alert">
                    {errors.other_major}
                  </span>
                )}
              </div>
            )}
          </fieldset>

          <button type="submit" className="btn btn-primary btn-submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </form>
      </main>
    </div>
  );
}
