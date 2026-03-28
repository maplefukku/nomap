import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { toast } from "sonner";
import { messages } from "@/lib/i18n";
import { useTransformApi } from "../use-transform-api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// sonner toast mock
vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

const successResponse = {
  ok: true,
  json: async () => ({
    results: [
      {
        avoidPattern: "テスト",
        direction: "テスト方向",
        values: "テスト価値",
        firstAction: "テストアクション",
        esPhrase: "テストフレーズ",
      },
    ],
  }),
};

describe("useTransformApi - handleRetry", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("lastRejectionsが空の場合、handleRetryはhandleSubmitを呼ばない", () => {
    const { result } = renderHook(() => useTransformApi());

    act(() => {
      result.current.handleRetry();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("lastRejectionsがある場合、handleRetryはhandleSubmitを再実行する", async () => {
    mockFetch.mockResolvedValue(successResponse);

    const { result } = renderHook(() => useTransformApi());

    await act(async () => {
      await result.current.handleSubmit(["テスト拒否"]);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.handleRetry();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe("useTransformApi - handleShare", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.mocked(toast.error).mockClear();
  });

  it("ポップアップがブロックされた場合エラートーストを表示する", async () => {
    mockFetch.mockResolvedValue(successResponse);
    const mockOpen = vi.fn().mockReturnValue(null);
    window.open = mockOpen;

    const { result } = renderHook(() => useTransformApi());

    await act(async () => {
      await result.current.handleSubmit(["テスト拒否"]);
    });

    act(() => {
      result.current.handleShare();
    });

    expect(mockOpen).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(messages.client.sharePopupBlocked);
  });

  it("ポップアップが正常に開いた場合トーストを表示しない", async () => {
    mockFetch.mockResolvedValue(successResponse);
    const mockOpen = vi.fn().mockReturnValue({ closed: false });
    window.open = mockOpen;

    const { result } = renderHook(() => useTransformApi());

    await act(async () => {
      await result.current.handleSubmit(["テスト拒否"]);
    });

    act(() => {
      result.current.handleShare();
    });

    expect(mockOpen).toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
