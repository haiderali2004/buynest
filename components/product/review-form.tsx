"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function ReviewForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title: title || undefined, comment: comment || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Couldn't submit your review.");
        return;
      }

      setSubmitted(true);
      toast.success("Thanks for your review!");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <p className="text-sm text-bottle">Your review has been posted. Thank you!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border border-border bg-paper p-5">
      <p className="font-display text-lg text-foreground">Write a review</p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "size-6",
                (hoverRating || rating) >= value
                  ? "fill-brass text-brass"
                  : "fill-none text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>

      <div>
        <Label htmlFor="review-title">Title (optional)</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="review-comment">Comment (optional)</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="mt-1.5"
        />
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}

      <Button type="submit" disabled={submitting} className="mt-1 self-start">
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}

export { ReviewForm };
