"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const transcriptShare_1 = require("./transcriptShare");
function splitJsonlLines(jsonl) {
  return jsonl.split("\n").filter((line) => line.trim().length > 0);
}
(0, bun_test_1.describe)("buildChatJsonlForSharing", () => {
  (0, bun_test_1.it)(
    "strips tool output and sets state to output-redacted when includeToolOutput=false",
    () => {
      const messages = [
        {
          id: "assistant-1",
          role: "assistant",
          parts: [
            {
              type: "dynamic-tool",
              toolCallId: "tc-1",
              toolName: "bash",
              state: "output-available",
              input: { script: "echo hi" },
              output: { success: true, output: "hi" },
            },
          ],
        },
      ];
      const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages, {
        includeToolOutput: false,
      });
      (0, bun_test_1.expect)(jsonl.endsWith("\n")).toBe(true);
      const parsed = JSON.parse(splitJsonlLines(jsonl)[0]);
      const part = parsed.parts[0];
      (0, bun_test_1.expect)(part.type).toBe("dynamic-tool");
      if (part.type !== "dynamic-tool") {
        throw new Error("Expected tool part");
      }
      (0, bun_test_1.expect)(part.state).toBe("output-redacted");
      (0, bun_test_1.expect)(part).not.toHaveProperty("output");
      // Original messages should be unchanged (no mutation during stripping)
      const originalPart = messages[0].parts[0];
      if (originalPart.type !== "dynamic-tool") {
        throw new Error("Expected tool part");
      }
      (0, bun_test_1.expect)(originalPart.state).toBe("output-available");
      (0, bun_test_1.expect)(originalPart).toHaveProperty("output");
    }
  );
  (0, bun_test_1.it)(
    "strips nestedCalls output and sets nestedCalls state to output-redacted when includeToolOutput=false",
    () => {
      const messages = [
        {
          id: "assistant-1",
          role: "assistant",
          parts: [
            {
              type: "dynamic-tool",
              toolCallId: "tc-1",
              toolName: "code_execution",
              state: "input-available",
              input: { code: "console.log('hi')" },
              nestedCalls: [
                {
                  toolCallId: "nested-1",
                  toolName: "bash",
                  input: { script: "echo nested" },
                  output: { success: true, output: "nested" },
                  state: "output-available",
                },
              ],
            },
          ],
        },
      ];
      const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages, {
        includeToolOutput: false,
      });
      const parsed = JSON.parse(splitJsonlLines(jsonl)[0]);
      const part = parsed.parts[0];
      if (part.type !== "dynamic-tool") {
        throw new Error("Expected tool part");
      }
      (0, bun_test_1.expect)(part.state).toBe("input-available");
      (0, bun_test_1.expect)(part.nestedCalls?.[0].state).toBe("output-redacted");
      (0, bun_test_1.expect)(part.nestedCalls?.[0]).not.toHaveProperty("output");
      // Original nested call should still include output
      const originalPart = messages[0].parts[0];
      if (originalPart.type !== "dynamic-tool") {
        throw new Error("Expected tool part");
      }
      (0, bun_test_1.expect)(originalPart.nestedCalls?.[0].state).toBe("output-available");
      (0, bun_test_1.expect)(originalPart.nestedCalls?.[0]).toHaveProperty("output");
    }
  );
  (0, bun_test_1.it)("leaves messages unchanged when includeToolOutput=true", () => {
    const messages = [
      {
        id: "assistant-1",
        role: "assistant",
        parts: [
          {
            type: "dynamic-tool",
            toolCallId: "tc-1",
            toolName: "bash",
            state: "output-available",
            input: { script: "echo hi" },
            output: { success: true, output: "hi" },
            nestedCalls: [
              {
                toolCallId: "nested-1",
                toolName: "file_read",
                input: { file_path: "/tmp/demo.txt" },
                output: { success: true, content: "hello" },
                state: "output-available",
              },
            ],
          },
        ],
      },
    ];
    const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages, {
      includeToolOutput: true,
    });
    const parsed = JSON.parse(splitJsonlLines(jsonl)[0]);
    (0, bun_test_1.expect)(parsed).toEqual(messages[0]);
  });
  (0, bun_test_1.it)(
    "inlines planContent into propose_plan tool output when planSnapshot matches",
    () => {
      const messages = [
        {
          id: "assistant-1",
          role: "assistant",
          parts: [
            {
              type: "dynamic-tool",
              toolCallId: "tc-1",
              toolName: "propose_plan",
              state: "output-available",
              input: { title: "My Plan" },
              output: { success: true, planPath: "/tmp/plan.md", message: "Plan saved" },
            },
          ],
        },
      ];
      const planSnapshot = { path: "/tmp/plan.md", content: "# My Plan\n\n- Step 1" };
      const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages, {
        includeToolOutput: true,
        planSnapshot,
      });
      const parsed = JSON.parse(splitJsonlLines(jsonl)[0]);
      const part = parsed.parts[0];
      if (part.type !== "dynamic-tool" || part.state !== "output-available") {
        throw new Error("Expected completed tool part");
      }
      const output = part.output;
      if (output === null || typeof output !== "object") {
        throw new Error("Expected tool output object");
      }
      (0, bun_test_1.expect)(output.planContent).toBe(planSnapshot.content);
      // Original messages should be unchanged (no mutation during injection)
      const originalPart = messages[0].parts[0];
      if (originalPart.type !== "dynamic-tool" || originalPart.state !== "output-available") {
        throw new Error("Expected completed tool part");
      }
      const originalOutput = originalPart.output;
      if (originalOutput === null || typeof originalOutput !== "object") {
        throw new Error("Expected tool output object");
      }
      (0, bun_test_1.expect)(originalOutput.planContent).toBeUndefined();
    }
  );
  (0, bun_test_1.it)(
    "inlines planContent even when propose_plan planPath uses ~ but planSnapshot.path is resolved",
    () => {
      const messages = [
        {
          id: "assistant-1",
          role: "assistant",
          parts: [
            {
              type: "dynamic-tool",
              toolCallId: "tc-1",
              toolName: "propose_plan",
              state: "output-available",
              input: { title: "My Plan" },
              output: {
                success: true,
                planPath: "~/.mux/plans/p/w.md",
                message: "Plan saved",
              },
            },
          ],
        },
      ];
      const planSnapshot = {
        path: "/home/user/.mux/plans/p/w.md",
        content: "# My Plan\n\n- Step 1",
      };
      const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages, {
        includeToolOutput: true,
        planSnapshot,
      });
      const parsed = JSON.parse(splitJsonlLines(jsonl)[0]);
      const part = parsed.parts[0];
      if (part.type !== "dynamic-tool" || part.state !== "output-available") {
        throw new Error("Expected completed tool part");
      }
      const output = part.output;
      if (output === null || typeof output !== "object") {
        throw new Error("Expected tool output object");
      }
      (0, bun_test_1.expect)(output.planContent).toBe(planSnapshot.content);
    }
  );
  (0, bun_test_1.it)(
    "inlines planContent even when propose_plan planPath uses Windows-style slashes",
    () => {
      const messages = [
        {
          id: "assistant-1",
          role: "assistant",
          parts: [
            {
              type: "dynamic-tool",
              toolCallId: "tc-1",
              toolName: "propose_plan",
              state: "output-available",
              input: { title: "My Plan" },
              output: {
                success: true,
                planPath: "~\\.mux\\plans\\p\\w.md",
                message: "Plan saved",
              },
            },
          ],
        },
      ];
      const planSnapshot = {
        path: "C:\\Users\\user\\.mux\\plans\\p\\w.md",
        content: "# My Plan\n\n- Step 1",
      };
      const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages, {
        includeToolOutput: true,
        planSnapshot,
      });
      const parsed = JSON.parse(splitJsonlLines(jsonl)[0]);
      const part = parsed.parts[0];
      if (part.type !== "dynamic-tool" || part.state !== "output-available") {
        throw new Error("Expected completed tool part");
      }
      const output = part.output;
      if (output === null || typeof output !== "object") {
        throw new Error("Expected tool output object");
      }
      (0, bun_test_1.expect)(output.planContent).toBe(planSnapshot.content);
    }
  );
  (0, bun_test_1.it)(
    "inlines planContent even when planSnapshot.path differs from propose_plan planPath",
    () => {
      const messages = [
        {
          id: "assistant-1",
          role: "assistant",
          parts: [
            {
              type: "dynamic-tool",
              toolCallId: "tc-1",
              toolName: "propose_plan",
              state: "output-available",
              input: { title: "My Plan" },
              output: { success: true, planPath: "/tmp/plan.md", message: "Plan saved" },
            },
          ],
        },
      ];
      const planSnapshot = {
        path: "/completely/different/plan.md",
        content: "# My Plan\n\n- Step 1",
      };
      const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages, {
        includeToolOutput: true,
        planSnapshot,
      });
      const parsed = JSON.parse(splitJsonlLines(jsonl)[0]);
      const part = parsed.parts[0];
      if (part.type !== "dynamic-tool" || part.state !== "output-available") {
        throw new Error("Expected completed tool part");
      }
      const output = part.output;
      if (output === null || typeof output !== "object") {
        throw new Error("Expected tool output object");
      }
      (0, bun_test_1.expect)(output.planContent).toBe(planSnapshot.content);
    }
  );
  (0, bun_test_1.it)(
    "preserves propose_plan output (with planContent) while stripping other tool outputs when includeToolOutput=false",
    () => {
      const messages = [
        {
          id: "assistant-1",
          role: "assistant",
          parts: [
            {
              type: "dynamic-tool",
              toolCallId: "tc-plan",
              toolName: "propose_plan",
              state: "output-available",
              input: { title: "My Plan" },
              output: { success: true, planPath: "/tmp/plan.md", message: "Plan saved" },
            },
            {
              type: "dynamic-tool",
              toolCallId: "tc-bash",
              toolName: "bash",
              state: "output-available",
              input: { script: "echo hi" },
              output: { success: true, output: "hi" },
            },
          ],
        },
      ];
      const planSnapshot = { path: "/tmp/plan.md", content: "# My Plan\n\n- Step 1" };
      const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages, {
        includeToolOutput: false,
        planSnapshot,
      });
      const parsed = JSON.parse(splitJsonlLines(jsonl)[0]);
      const planPart = parsed.parts[0];
      if (planPart.type !== "dynamic-tool" || planPart.state !== "output-available") {
        throw new Error("Expected completed propose_plan tool part");
      }
      const planOutput = planPart.output;
      if (planOutput === null || typeof planOutput !== "object") {
        throw new Error("Expected propose_plan output object");
      }
      (0, bun_test_1.expect)(planOutput.planContent).toBe(planSnapshot.content);
      const strippedPart = parsed.parts[1];
      if (strippedPart.type !== "dynamic-tool") {
        throw new Error("Expected tool part");
      }
      (0, bun_test_1.expect)(strippedPart.state).toBe("output-redacted");
      (0, bun_test_1.expect)(strippedPart).not.toHaveProperty("output");
      // Original messages should be unchanged (no mutation during injection/stripping)
      const originalPlanPart = messages[0].parts[0];
      if (
        originalPlanPart.type !== "dynamic-tool" ||
        originalPlanPart.state !== "output-available"
      ) {
        throw new Error("Expected completed propose_plan tool part");
      }
      const originalPlanOutput = originalPlanPart.output;
      if (originalPlanOutput === null || typeof originalPlanOutput !== "object") {
        throw new Error("Expected propose_plan output object");
      }
      (0, bun_test_1.expect)(originalPlanOutput.planContent).toBeUndefined();
      const originalStrippedPart = messages[0].parts[1];
      if (originalStrippedPart.type !== "dynamic-tool") {
        throw new Error("Expected tool part");
      }
      (0, bun_test_1.expect)(originalStrippedPart.state).toBe("output-available");
      (0, bun_test_1.expect)(originalStrippedPart).toHaveProperty("output");
    }
  );
  (0, bun_test_1.it)(
    "preserves task tool outputs while stripping other tool outputs when includeToolOutput=false",
    () => {
      const messages = [
        {
          id: "assistant-1",
          role: "assistant",
          parts: [
            {
              type: "dynamic-tool",
              toolCallId: "tc-task",
              toolName: "task",
              state: "output-available",
              input: { prompt: "Fix the bug", title: "Bug fix" },
              output: {
                status: "completed",
                taskId: "task-123",
                reportMarkdown: "## Report\n\nFixed the bug in foo.ts",
              },
            },
            {
              type: "dynamic-tool",
              toolCallId: "tc-bash",
              toolName: "bash",
              state: "output-available",
              input: { script: "echo hi" },
              output: { success: true, output: "hi" },
            },
          ],
        },
      ];
      const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages, {
        includeToolOutput: false,
      });
      const parsed = JSON.parse(splitJsonlLines(jsonl)[0]);
      // task output should be preserved
      const taskPart = parsed.parts[0];
      if (taskPart.type !== "dynamic-tool" || taskPart.state !== "output-available") {
        throw new Error("Expected completed task tool part");
      }
      const taskOutput = taskPart.output;
      if (taskOutput === null || typeof taskOutput !== "object") {
        throw new Error("Expected task output object");
      }
      (0, bun_test_1.expect)(taskOutput.reportMarkdown).toBe(
        "## Report\n\nFixed the bug in foo.ts"
      );
      // bash output should be stripped
      const strippedPart = parsed.parts[1];
      if (strippedPart.type !== "dynamic-tool") {
        throw new Error("Expected tool part");
      }
      (0, bun_test_1.expect)(strippedPart.state).toBe("output-redacted");
      (0, bun_test_1.expect)(strippedPart).not.toHaveProperty("output");
    }
  );
  (0, bun_test_1.it)("does not overwrite propose_plan planContent when already present", () => {
    const messages = [
      {
        id: "assistant-1",
        role: "assistant",
        parts: [
          {
            type: "dynamic-tool",
            toolCallId: "tc-1",
            toolName: "propose_plan",
            state: "output-available",
            input: { title: "My Plan" },
            output: {
              success: true,
              planPath: "/tmp/plan.md",
              message: "Plan saved",
              planContent: "# Existing Plan\n\nDo the thing.",
            },
          },
        ],
      },
    ];
    const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages, {
      includeToolOutput: true,
      planSnapshot: { path: "/tmp/plan.md", content: "# New Plan" },
    });
    const parsed = JSON.parse(splitJsonlLines(jsonl)[0]);
    const part = parsed.parts[0];
    if (part.type !== "dynamic-tool" || part.state !== "output-available") {
      throw new Error("Expected completed tool part");
    }
    const output = part.output;
    if (output === null || typeof output !== "object") {
      throw new Error("Expected tool output object");
    }
    (0, bun_test_1.expect)(output.planContent).toBe("# Existing Plan\n\nDo the thing.");
  });
  (0, bun_test_1.it)("injects workspaceId into each message when provided", () => {
    const messages = [
      {
        id: "user-1",
        role: "user",
        parts: [{ type: "text", text: "hello" }],
      },
    ];
    const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages, {
      workspaceId: "ws-123",
    });
    const parsed = JSON.parse(splitJsonlLines(jsonl)[0]);
    (0, bun_test_1.expect)(parsed.workspaceId).toBe("ws-123");
    (0, bun_test_1.expect)(messages[0].workspaceId).toBeUndefined();
  });
  (0, bun_test_1.it)("returns empty string for empty messages array", () => {
    (0, bun_test_1.expect)((0, transcriptShare_1.buildChatJsonlForSharing)([])).toBe("");
  });
  (0, bun_test_1.it)("merges adjacent text/reasoning parts to keep transcripts small", () => {
    const messages = [
      {
        id: "assistant-1",
        role: "assistant",
        parts: [
          { type: "reasoning", text: "a", timestamp: 1 },
          { type: "reasoning", text: "b", timestamp: 2 },
          {
            type: "dynamic-tool",
            toolCallId: "tc-1",
            toolName: "bash",
            state: "input-available",
            input: { script: "echo hi" },
          },
          { type: "text", text: "hello", timestamp: 3 },
          { type: "text", text: " world", timestamp: 4 },
          { type: "reasoning", text: "c" },
        ],
      },
    ];
    const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages, {
      includeToolOutput: true,
    });
    const parsed = JSON.parse(splitJsonlLines(jsonl)[0]);
    (0, bun_test_1.expect)(parsed.parts).toEqual([
      { type: "reasoning", text: "ab", timestamp: 1 },
      {
        type: "dynamic-tool",
        toolCallId: "tc-1",
        toolName: "bash",
        state: "input-available",
        input: { script: "echo hi" },
      },
      { type: "text", text: "hello world", timestamp: 3 },
      { type: "reasoning", text: "c" },
    ]);
    // Original messages should be unchanged (no mutation during compaction)
    (0, bun_test_1.expect)(messages[0].parts).toHaveLength(6);
  });
  (0, bun_test_1.it)("produces valid JSONL (each line parses, trailing newline)", () => {
    const messages = [
      {
        id: "user-1",
        role: "user",
        parts: [{ type: "text", text: "hello" }],
      },
      {
        id: "assistant-1",
        role: "assistant",
        parts: [{ type: "text", text: "world" }],
      },
    ];
    const jsonl = (0, transcriptShare_1.buildChatJsonlForSharing)(messages);
    (0, bun_test_1.expect)(jsonl.endsWith("\n")).toBe(true);
    const lines = splitJsonlLines(jsonl);
    (0, bun_test_1.expect)(lines).toHaveLength(messages.length);
    const parsed = lines.map((line) => JSON.parse(line));
    (0, bun_test_1.expect)(parsed).toEqual(messages);
  });
});
//# sourceMappingURL=transcriptShare.test.js.map
