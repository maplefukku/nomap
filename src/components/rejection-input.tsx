"use client";

import { useState, useRef, useCallback, memo, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tagAnimation, hoverTap } from "@/lib/constants";
import { MAX_REJECTION_LENGTH } from "@/lib/constants";

interface RejectionInputProps {
  onSubmit: (rejections: string[]) => void;
  isLoading?: boolean;
}

export const RejectionInput = memo(function RejectionInput({
  onSubmit,
  isLoading,
}: RejectionInputProps) {
  const [items, setItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addItem = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_REJECTION_LENGTH) {
      setHint(`${MAX_REJECTION_LENGTH}文字以内で入力してください`);
      return;
    }
    setItems((prev) => {
      if (prev.includes(trimmed)) {
        setHint("すでに追加されています");
        return prev;
      }
      setHint(null);
      return [...prev, trimmed];
    });
    setInputValue("");
  }, [inputValue]);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
    if (e.key === "Backspace" && inputValue === "" && items.length > 0) {
      removeItem(items.length - 1);
    }
  };

  const handleSubmit = () => {
    if (items.length > 0) {
      onSubmit(items);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          やりたくないことを教えて
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          「やりたくないこと」を入力してEnterで追加。
          あなたの拒否から、進むべき方向を見つけます。
        </p>
      </div>

      <div
        className="flex min-h-[120px] flex-wrap items-start gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20"
        onClick={() => inputRef.current?.focus()}
        role="group"
        aria-label="拒否リスト入力エリア"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.span
              key={item}
              layout
              {...tagAnimation}
              className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-1.5 text-sm text-foreground"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(index);
                }}
                className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                aria-label={`「${item}」を削除`}
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1l6 6M7 1L1 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (hint) setHint(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            items.length === 0 ? "例：満員電車で通勤する" : "さらに追加..."
          }
          maxLength={MAX_REJECTION_LENGTH}
          className="min-w-[120px] flex-1 bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:outline-none sm:min-w-[180px]"
          disabled={isLoading}
          aria-label="拒否項目を入力"
          aria-describedby={hint ? "input-hint" : undefined}
        />
      </div>

      {hint && (
        <p id="input-hint" className="text-xs text-destructive" role="alert">
          {hint}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span
          className="text-xs text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {items.length > 0
            ? `${items.length}件の拒否`
            : "Enterで追加、Backspaceで削除"}
        </span>
        <motion.button
          {...hoverTap}
          onClick={handleSubmit}
          disabled={items.length === 0 || isLoading}
          type="button"
          aria-label={isLoading ? "分析中" : "方向を見つける"}
          aria-busy={isLoading}
          className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {isLoading ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
              分析中...
            </>
          ) : (
            "方向を見つける"
          )}
        </motion.button>
      </div>
    </div>
  );
});
