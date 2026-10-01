import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components use `data-ocid` as their stable test hook.
configure({ testIdAttribute: "data-ocid" });

// Vitest does not expose the globals RTL's auto-cleanup looks for, so unmount
// between tests explicitly; otherwise each render stacks on the last.
afterEach(() => {
  cleanup();
});
