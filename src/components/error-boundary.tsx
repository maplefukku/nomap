"use client";

import { Component, type ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeInUp, hoverTap } from "@/lib/constants";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

const errorAnim = fadeInUp(8);

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          {...errorAnim}
          className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"
          role="alert"
        >
          <p className="text-sm text-destructive">
            {this.props.fallbackMessage ?? "表示中にエラーが発生しました"}
          </p>
          <motion.button
            {...hoverTap}
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            再表示する
          </motion.button>
        </motion.div>
      );
    }
    return this.props.children;
  }
}
