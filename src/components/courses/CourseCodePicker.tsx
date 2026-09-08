import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const KEY = "chuo-lms:recent-course-codes";

export function useRecentCourseCodes() {
  const [codes, setCodes] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setCodes(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  function remember(code: string) {
    setCodes((prev) => {
      const next = [code, ...prev.filter((c) => c !== code)].slice(0, 8);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function forget(code: string) {
    setCodes((prev) => {
      const next = prev.filter((c) => c !== code);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return { codes, remember, forget };
}

/**
 * The backend has no "list all courses" endpoint, so course-scoped screens
 * are opened by entering a course code. Recently used codes are kept locally.
 */
export function CourseCodePicker({
  value,
  onSelect,
  suggestions = [],
  label = "Open a course",
  description = "Enter a course code, e.g. CSC301. The backend looks courses up by code.",
}: {
  value: string;
  onSelect: (code: string) => void;
  suggestions?: string[];
  label?: string;
  description?: string;
}) {
  const [input, setInput] = useState(value);
  const { codes, remember, forget } = useRecentCourseCodes();

  useEffect(() => setInput(value), [value]);

  const chips = Array.from(new Set([...suggestions, ...codes])).filter(Boolean);

  function submit(code: string) {
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    remember(clean);
    onSelect(clean);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="CSC301"
            className="uppercase"
          />
          <Button type="submit">
            <Search className="mr-2 size-4" /> Open
          </Button>
        </form>
        {chips.length ? (
          <div className="flex flex-wrap gap-2">
            {chips.map((code) => (
              <span
                key={code}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium"
              >
                <button type="button" onClick={() => submit(code)}>
                  {code}
                </button>
                {codes.includes(code) ? (
                  <button
                    type="button"
                    aria-label={`Remove ${code}`}
                    onClick={() => forget(code)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
