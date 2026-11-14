"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  reviewApi,
  type ReviewItem,
  type ReviewSummaryData,
} from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

export function ProductReviews({ slug }: { slug: string }) {
  const [summary, setSummary] = useState<ReviewSummaryData | null>(null);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasMine, setHasMine] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");

    Promise.all([reviewApi.summary(slug), reviewApi.list(slug, page)])
      .then(([s, list]) => {
        if (!active) return;
        setSummary(s);
        setItems(list.content);
        setTotalPages(list.totalPages);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(
          err instanceof Error ? err.message : "Reviews could not be loaded.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, page, reloadKey]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (rating < 1) {
      setFormMessage("Choose a star rating from 1 to 5.");
      return;
    }
    setSaving(true);
    setFormMessage("");
    try {
      const body = { rating, comment: comment.trim() || undefined };
      if (hasMine) {
        await reviewApi.update(slug, body);
      } else {
        await reviewApi.create(slug, body);
      }
      setHasMine(true);
      setFormMessage("Your review is saved.");
      setReloadKey((k) => k + 1);
    } catch (err) {
      setFormMessage(
        err instanceof Error ? err.message : "Your review could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeMine() {
    setSaving(true);
    setFormMessage("");
    try {
      await reviewApi.remove(slug);
      setHasMine(false);
      setRating(0);
      setComment("");
      setFormMessage("Your review was deleted.");
      setReloadKey((k) => k + 1);
    } catch (err) {
      setFormMessage(
        err instanceof Error ? err.message : "Your review could not be deleted.",
      );
    } finally {
      setSaving(false);
    }
  }

  const total = summary?.count ?? 0;
  const starRows = [5, 4, 3, 2, 1];

  return (
    <section aria-labelledby="reviews-heading" className="mt-12">
      <h2 id="reviews-heading" className="text-xl font-semibold text-text">
        Customer reviews
      </h2>

      {loading && !summary && (
        <p role="status" className="mt-3 text-text-muted">
          Loading reviews…
        </p>
      )}

      {loadError && (
        <p role="alert" className="mt-3 text-red-600">
          {loadError}
        </p>
      )}

      {summary && (
        <div className="mt-4 grid gap-6 md:grid-cols-[200px_1fr]">
          <div>
            <p className="text-4xl font-bold text-text">
              {summary.average.toFixed(1)}
              <span className="text-base font-normal text-text-muted"> / 5</span>
            </p>
            <p className="text-sm text-text-muted">
              {total} {total === 1 ? "review" : "reviews"}
            </p>
          </div>

          <ul className="flex flex-col gap-2" aria-label="Rating breakdown">
            {starRows.map((star) => {
              const count = summary.distribution[String(star)] ?? 0;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <li key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-text">{star} star</span>
                  <span className="relative h-2 flex-1 overflow-hidden rounded bg-border">
                    <span
                      className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-10 text-right text-text-muted">{count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <ul className="mt-6 flex flex-col gap-4">
        {items.map((r) => (
          <li key={r.id} className="rounded-xl border border-border p-4">
            <p className="font-medium text-text">
              {"★".repeat(r.rating)}
              <span className="sr-only"> {r.rating} out of 5 stars</span>
            </p>
            {r.comment && <p className="mt-2 text-text">{r.comment}</p>}
            <p className="mt-2 text-sm text-text-muted">
              {r.reviewerName} · {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>

      {!loading && items.length === 0 && !loadError && (
        <p className="mt-4 text-text-muted">No reviews yet. Be the first to review.</p>
      )}

      {totalPages > 1 && (
        <nav aria-label="Review pages" className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 0}
            className="min-h-11 rounded-xl border border-border px-4 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-text-muted" aria-live="polite">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="min-h-11 rounded-xl border border-border px-4 disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}

      <div className="mt-8 rounded-xl border border-border p-4">
        {!loggedIn ? (
          <p className="text-text-muted">Sign in to write a review.</p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-text">Your rating</legend>
              <div role="radiogroup" aria-label="Star rating" className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onClick={() => setRating(n)}
                    className={`min-h-11 min-w-11 rounded-xl border border-border text-lg ${
                      rating >= n ? "bg-[var(--accent)] text-[var(--accent-text)]" : "text-text"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1">
              <label htmlFor="review-comment" className="text-sm font-medium text-text">
                Comment (optional)
              </label>
              <textarea
                id="review-comment"
                value={comment}
                maxLength={2000}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="rounded-xl border border-border p-3 text-text"
              />
            </div>

            {formMessage && (
              <p role="status" className="text-sm text-text">
                {formMessage}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 rounded-xl bg-[var(--accent)] px-5 font-medium text-[var(--accent-text)] disabled:opacity-60"
              >
                {hasMine ? "Update review" : "Submit review"}
              </button>
              {hasMine && (
                <button
                  type="button"
                  onClick={removeMine}
                  disabled={saving}
                  className="min-h-11 rounded-xl border border-border px-5 text-text disabled:opacity-60"
                >
                  Delete my review
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}