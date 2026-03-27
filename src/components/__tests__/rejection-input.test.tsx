import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RejectionInput } from "../rejection-input";

// Mock framer-motion to avoid animation issues in tests
const motionProps = [
  "whileHover",
  "whileTap",
  "whileFocus",
  "whileDrag",
  "whileInView",
  "layout",
  "layoutId",
  "initial",
  "animate",
  "exit",
  "transition",
  "variants",
  "drag",
  "dragConstraints",
  "onDragEnd",
];

function filterMotionProps(props: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!motionProps.includes(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

vi.mock("framer-motion", () => ({
  motion: {
    span: ({ children, ...props }: Record<string, unknown>) => (
      <span {...filterMotionProps(props)}>{children as React.ReactNode}</span>
    ),
    button: ({ children, ...props }: Record<string, unknown>) => (
      <button {...filterMotionProps(props)}>
        {children as React.ReactNode}
      </button>
    ),
    div: ({ children, ...props }: Record<string, unknown>) => (
      <div {...filterMotionProps(props)}>{children as React.ReactNode}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("RejectionInput", () => {
  it("renders with placeholder text", () => {
    render(<RejectionInput onSubmit={vi.fn()} />);
    expect(
      screen.getByPlaceholderText("例：満員電車で通勤する")
    ).toBeInTheDocument();
  });

  it("renders heading and description", () => {
    render(<RejectionInput onSubmit={vi.fn()} />);
    expect(
      screen.getByText("やりたくないことを教えて")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/「やりたくないこと」を入力してEnterで追加/)
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

    expect(screen.getByText("Enterで追加")).toBeInTheDocument();
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

    expect(screen.getByText("2件の拒否")).toBeInTheDocument();
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

  it("handleSubmitはアイテムが0件の場合onSubmitを呼ばない", () => {
    const onSubmit = vi.fn();
    render(<RejectionInput onSubmit={onSubmit} />);

    const submitBtn = screen.getByLabelText("方向を見つける") as HTMLButtonElement;

    // React内部のpropsからonClickハンドラを直接取得して呼び出す
    const propsKey = Object.keys(submitBtn).find((k) => k.startsWith("__reactProps$"));
    const props = (submitBtn as unknown as Record<string, Record<string, () => void>>)[propsKey!];
    props.onClick();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("changes placeholder after adding items", async () => {
    const user = userEvent.setup();
    render(<RejectionInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("拒否項目を入力");
    await user.type(input, "残業する{Enter}");

    expect(input).toHaveAttribute("placeholder", "さらに追加...");
  });
});
