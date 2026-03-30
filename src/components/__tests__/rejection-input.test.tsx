import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RejectionInput } from "../rejection-input";

vi.mock("framer-motion", () => import("@/test/mock-framer-motion"));

describe("RejectionInput", () => {
  it("renders with placeholder text", () => {
    render(<RejectionInput onSubmit={vi.fn()} />);
    expect(
      screen.getByPlaceholderText("例：満員電車で通勤する"),
    ).toBeInTheDocument();
  });

  it("renders heading and description", () => {
    render(<RejectionInput onSubmit={vi.fn()} />);
    expect(screen.getByText("やりたくないことを教えて")).toBeInTheDocument();
    expect(
      screen.getByText(/「やりたくないこと」を入力してEnterで追加/),
    ).toBeInTheDocument();
  });

  it("adds an item when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    await user.type(input, "満員電車で通勤する{Enter}");

    expect(screen.getByText("満員電車で通勤する")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("does not add duplicate items", async () => {
    const user = userEvent.setup();
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    await user.type(input, "残業する{Enter}");
    await user.type(input, "残業する{Enter}");

    const items = screen.getAllByText("残業する");
    expect(items).toHaveLength(1);
  });

  it("does not add empty items", async () => {
    const user = userEvent.setup();
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    await user.type(input, "   {Enter}");

    expect(
      screen.getByText("Enterで追加、Backspaceで削除"),
    ).toBeInTheDocument();
  });

  it("文字数上限を超えた入力はヒントを表示して追加されない", () => {
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    const longText = "あ".repeat(201);
    fireEvent.change(input, { target: { value: longText } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(
      screen.getByText("200文字以内で入力してください"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enterで追加、Backspaceで削除"),
    ).toBeInTheDocument();
  });

  it("ヒント表示中に入力するとヒントがクリアされる", () => {
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    const longText = "あ".repeat(201);
    fireEvent.change(input, { target: { value: longText } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(
      screen.getByText("200文字以内で入力してください"),
    ).toBeInTheDocument();

    // 入力を変更するとヒントがクリアされる
    fireEvent.change(input, { target: { value: "テスト" } });
    expect(
      screen.queryByText("200文字以内で入力してください"),
    ).not.toBeInTheDocument();
  });

  it("空文字のままEnterを押しても追加されない", async () => {
    const user = userEvent.setup();
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    await user.keyboard("{Enter}");

    expect(
      screen.getByText("Enterで追加、Backspaceで削除"),
    ).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("removes an item when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    await user.type(input, "残業する{Enter}");
    expect(screen.getByText("残業する")).toBeInTheDocument();

    const removeBtn = screen.getByLabelText("「残業する」を削除");
    await user.click(removeBtn);

    expect(screen.queryByText("残業する")).not.toBeInTheDocument();
  });

  it("removes last item on Backspace when input is empty", async () => {
    const user = userEvent.setup();
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    await user.type(input, "残業する{Enter}");
    await user.type(input, "通勤する{Enter}");

    expect(screen.getByText("通勤する")).toBeInTheDocument();

    await user.type(input, "{Backspace}");
    expect(screen.queryByText("通勤する")).not.toBeInTheDocument();
    expect(screen.getByText("残業する")).toBeInTheDocument();
  });

  it("shows item count", async () => {
    const user = userEvent.setup();
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    await user.type(input, "残業する{Enter}");
    await user.type(input, "通勤する{Enter}");

    expect(screen.getByText("2 / 20")).toBeInTheDocument();
  });

  it("calls onSubmit with items when button is clicked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RejectionInput onSubmit={onSubmit} />);

    const input = screen.getByLabelText("拒否項目を入力");
    await user.type(input, "残業する{Enter}");
    await user.type(input, "通勤する{Enter}");

    const submitBtn = screen.getByText("方向を見つける");
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith(["残業する", "通勤する"]);
  });

  it("disables submit button when no items exist", () => {
    render(<RejectionInput onSubmit={vi.fn()} />);
    const submitBtn = screen.getByText("方向を見つける");
    expect(submitBtn).toBeDisabled();
  });

  it("shows loading state", () => {
    render(<RejectionInput onSubmit={vi.fn()} isLoading />);
    expect(screen.getByText("分析中...")).toBeInTheDocument();
  });

  it("Shift+Enterではアイテムが追加されない", () => {
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    fireEvent.change(input, { target: { value: "テスト項目" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });

    expect(screen.queryByText("テスト項目")).not.toBeInTheDocument();
    expect(input).toHaveValue("テスト項目");
  });

  it("IME入力中（compositionStart〜compositionEnd）はEnterでアイテムが追加されない", () => {
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    fireEvent.change(input, { target: { value: "日本語入力" } });

    // IME変換開始
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: "Enter" });

    // 変換中なのでアイテムは追加されない
    expect(screen.queryByText("日本語入力")).not.toBeInTheDocument();
    expect(input).toHaveValue("日本語入力");

    // IME変換確定
    fireEvent.compositionEnd(input);

    // 確定後はEnterで追加される
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("日本語入力")).toBeInTheDocument();
  });

  it("入力が空でアイテムがない状態でBackspaceを押しても何も起きない", () => {
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    fireEvent.keyDown(input, { key: "Backspace" });

    expect(
      screen.getByText("Enterで追加、Backspaceで削除"),
    ).toBeInTheDocument();
  });

  it("入力に文字がある状態でBackspaceを押してもアイテムは削除されない", async () => {
    const user = userEvent.setup();
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    await user.type(input, "残業する{Enter}");
    expect(screen.getByText("残業する")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "テスト" } });
    fireEvent.keyDown(input, { key: "Backspace" });

    expect(screen.getByText("残業する")).toBeInTheDocument();
  });

  it("MAX_REJECTIONSに達している場合、新しいアイテムが追加されずヒントが表示される", () => {
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");

    // 20個のアイテムを追加
    for (let i = 1; i <= 20; i++) {
      fireEvent.change(input, { target: { value: `項目${i}` } });
      fireEvent.keyDown(input, { key: "Enter" });
    }

    expect(screen.getByText("20 / 20")).toBeInTheDocument();

    // 21個目を追加しようとする
    fireEvent.change(input, { target: { value: "追加できない項目" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // アイテムが追加されない
    expect(screen.queryByText("追加できない項目")).not.toBeInTheDocument();
    // maxReachedヒントが表示される
    expect(screen.getByText("これ以上追加できません")).toBeInTheDocument();
  });

  it("changes placeholder after adding items", async () => {
    const user = userEvent.setup();
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    await user.type(input, "残業する{Enter}");

    expect(input).toHaveAttribute("placeholder", "さらに追加...");
  });
});
