"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toolHookEnv_1 = require("./toolHookEnv");
describe("flattenToolHookValueToEnv", () => {
  it("flattens a simple object", () => {
    expect(
      (0, toolHookEnv_1.flattenToolHookValueToEnv)({ script: "echo hi" }, "MUX_TOOL_INPUT")
    ).toEqual({
      MUX_TOOL_INPUT_SCRIPT: "echo hi",
    });
  });
  it("flattens nested objects", () => {
    expect(
      (0, toolHookEnv_1.flattenToolHookValueToEnv)(
        {
          opts: {
            timeout: 30,
          },
        },
        "MUX_TOOL_INPUT"
      )
    ).toEqual({
      MUX_TOOL_INPUT_OPTS_TIMEOUT: "30",
    });
  });
  it("flattens arrays and provides a _COUNT", () => {
    expect(
      (0, toolHookEnv_1.flattenToolHookValueToEnv)(
        {
          items: ["a", "b"],
        },
        "MUX_TOOL_INPUT"
      )
    ).toEqual({
      MUX_TOOL_INPUT_ITEMS_COUNT: "2",
      MUX_TOOL_INPUT_ITEMS_0: "a",
      MUX_TOOL_INPUT_ITEMS_1: "b",
    });
  });
  it("flattens arrays of objects", () => {
    expect(
      (0, toolHookEnv_1.flattenToolHookValueToEnv)(
        {
          items: [{ name: "x" }, { name: "y" }],
        },
        "MUX_TOOL_INPUT"
      )
    ).toEqual({
      MUX_TOOL_INPUT_ITEMS_COUNT: "2",
      MUX_TOOL_INPUT_ITEMS_0_NAME: "x",
      MUX_TOOL_INPUT_ITEMS_1_NAME: "y",
    });
  });
  it("converts numbers and booleans to strings", () => {
    expect((0, toolHookEnv_1.flattenToolHookValueToEnv)({ num: 42, flag: true }, "PREFIX")).toEqual(
      {
        PREFIX_NUM: "42",
        PREFIX_FLAG: "true",
      }
    );
  });
  it("does not emit a root env var for non-object values", () => {
    expect((0, toolHookEnv_1.flattenToolHookValueToEnv)("hello", "MUX_TOOL_INPUT")).toEqual({});
  });
  it("sanitizes keys so env var names are shell-friendly", () => {
    expect((0, toolHookEnv_1.flattenToolHookValueToEnv)({ "a-b": { "c.d": 1 } }, "PFX")).toEqual({
      PFX_A_B_C_D: "1",
    });
  });
  it("splits camelCase keys into underscore-separated words", () => {
    expect((0, toolHookEnv_1.flattenToolHookValueToEnv)({ filePath: "x" }, "PFX")).toEqual({
      PFX_FILE_PATH: "x",
    });
  });
  it("does not collapse empty key parts back to the prefix", () => {
    expect((0, toolHookEnv_1.flattenToolHookValueToEnv)({ " ": "x" }, "PFX")).toEqual({
      PFX_EMPTY: "x",
    });
  });
  it("omits values larger than maxValueLength (does not truncate)", () => {
    expect(
      (0, toolHookEnv_1.flattenToolHookValueToEnv)(
        {
          big: "abcdef",
          ok: "x",
        },
        "PFX",
        { maxValueLength: 5 }
      )
    ).toEqual({
      PFX_OK: "x",
    });
  });
});
//# sourceMappingURL=toolHookEnv.test.js.map
