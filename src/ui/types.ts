import type { Settings } from "../config";
import type { Job } from "../jobs";

export interface WebSnapshot {
  pid: number;
  startedAt: number;
  heartbeatNextAt: number;
  settings: Settings;
  jobs: Job[];
}

export interface WebServerHandle {
  stop: () => void;
  host: string;
  port: number;
}

/**
 * Sinks the `/api/chat` SSE handler hands to `onChat`. Consumers that only
 * care about the assistant's visible reply use `onChunk` + `onUnblock`; the
 * tool sinks are optional and let UIs render structured tool activity (name,
 * arguments, result) alongside the text stream.
 */
export interface ChatStreamSinks {
  onChunk: (text: string) => void;
  onUnblock: () => void;
  onToolUse?: (toolUseId: string, name: string, input: unknown) => void;
  onToolResult?: (
    toolUseId: string,
    output: unknown,
    opts?: { isError?: boolean },
  ) => void;
}

export interface StartWebUiOptions {
  host: string;
  port: number;
  getSnapshot: () => WebSnapshot;
  onHeartbeatEnabledChanged?: (enabled: boolean) => void | Promise<void>;
  onHeartbeatSettingsChanged?: (patch: {
    enabled?: boolean;
    interval?: number;
    prompt?: string;
    excludeWindows?: Array<{ days?: number[]; start: string; end: string }>;
  }) => void | Promise<void>;
  onJobsChanged?: () => void | Promise<void>;
  /**
   * Invoked once per POST /api/chat. The implementation pushes text deltas
   * through `sinks.onChunk`, signals "first activity" through
   * `sinks.onUnblock`, and (optionally) surfaces structured tool activity
   * through `sinks.onToolUse` / `sinks.onToolResult` so the SSE stream can
   * carry per-tool start/end events for clients that render them.
   *
   * The legacy three-argument form `(message, onChunk, onUnblock)` is
   * still accepted at runtime for backwards compatibility (see
   * `invokeOnChat()` in `ui/server.ts`), but is no longer in the public
   * type — new code should use the sinks form.
   */
  onChat?: (message: string, sinks: ChatStreamSinks) => Promise<void>;
}
