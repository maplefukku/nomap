"use client";

import { Component, type ReactNode } from "react";
import { motion } from "framer-motion";
import { animations, hoverTap } from "@/lib/constants";
import { messages } from "@/lib/i18n";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }

  private handleRetry(): void {
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          {...animations.errorBoundary}
          className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"
          role="alert"
        >
          <p className="text-sm text-destructive">
            {this.props.fallbackMessage ??
              messages.errorBoundary.defaultMessage}
          </p>
          <motion.button
            {...hoverTap}
            type="button"
            onClick={this.handleRetry}
            autoFocus
            className="rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {messages.errorBoundary.retry}
          </motion.button>
        </motion.div>
      );
    }
    return this.props.children;
  }
}
