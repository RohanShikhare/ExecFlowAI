"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Upload, Circle, FileText, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useCreateInput } from "@/lib/hooks/useInputs";
import { extractErrorMessage } from "@/lib/api/errors";

export default function NewInputPage() {
  const router = useRouter();
  const createInput = useCreateInput();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canContinue = text.trim().length > 0 && !createInput.isPending;

  async function handleContinue() {
    setError(null);
    try {
      await createInput.mutateAsync({
        type: "TEXT",
        title: title.trim() || text.trim().slice(0, 60),
        rawText: text.trim(),
      });
      router.push("/inputs");
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <AppShell title="New Input">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center sm:mb-8">
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            New Input
          </h2>
          <p className="mt-1 text-sm text-muted">
            Provide unstructured information via voice or text.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {/* Voice Note - UI ready, wired up in the Storage & Transcription
              modules. Shown disabled so the full intended flow is visible
              now rather than added as an afterthought later. */}
          <div className="relative rounded-lg border border-border bg-surface p-6 sm:p-8">
            <span className="absolute right-4 top-4 rounded-full bg-canvas px-2.5 py-0.5 text-xs font-medium text-muted">
              Coming soon
            </span>
            <div className="flex flex-col items-center text-center opacity-50">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-canvas">
                <Mic size={26} />
              </div>
              <h3 className="text-lg font-semibold text-ink">Voice Note</h3>
              <p className="mt-1 text-sm text-muted">
                Drag &amp; drop MP3, WAV, or M4A files here, or start
                recording directly.
              </p>
              <button
                disabled
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-border py-2.5 text-sm font-medium text-ink"
              >
                <Upload size={15} />
                Upload Audio
              </button>
              <button
                disabled
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-md bg-danger py-2.5 text-sm font-medium text-white"
              >
                <Circle size={12} fill="currentColor" />
                Record
              </button>
            </div>
          </div>

          {/* Text / Message - live in this module */}
          <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <FileText size={18} />
              <h3 className="text-lg font-semibold text-ink">Text / Message</h3>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="mb-3 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type unstructured text here…"
              rows={8}
              className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-status-overdue-bg px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
          >
            {createInput.isPending ? "Saving…" : "Continue to Processing"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
