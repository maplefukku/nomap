import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { toast } from "sonner";
import { messages } from "@/lib/i18n";
import { buildResultData, buildClientAPIResponse } from "@/test/factories";
import { useTransformApi } from "../use-transform-api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// sonner toast mock
vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

const successResponse = buildClientAPIResponse([buildResultData()]);

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

describe("useTransformApi - データ検証", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("directionが文字列でない場合エラーがスローされる", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            avoidPattern: "テスト",
            direction: 123,
            values: "テスト価値",
            firstAction: "テストアクション",
            esPhrase: "テストフレーズ",
          },
        ],
      }),
    });

    const { result } = renderHook(() => useTransformApi());

    await act(async () => {
      await result.current.handleSubmit(["テスト拒否"]);
    });

    expect(result.current.error).toBe(messages.client.invalidResponse);
    expect(result.current.phase).toBe("input");
  });

  it("firstActionが文字列でない場合エラーがスローされる", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            avoidPattern: "テスト",
            direction: "テスト方向",
            values: "テスト価値",
            firstAction: 456,
            esPhrase: "テストフレーズ",
          },
        ],
      }),
    });

    const { result } = renderHook(() => useTransformApi());

    await act(async () => {
      await result.current.handleSubmit(["テスト拒否"]);
    });

    expect(result.current.error).toBe(messages.client.invalidResponse);
    expect(result.current.phase).toBe("input");
  });
});

describe("useTransformApi - handleShare", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.mocked(toast.error).mockClear();
  });

  it("結果が空の場合handleShareは何もしない", () => {
    const mockOpen = vi.fn();
    window.open = mockOpen;

    const { result } = renderHook(() => useTransformApi());

    act(() => {
      result.current.handleShare();
    });

    expect(mockOpen).not.toHaveBeenCalled();
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
