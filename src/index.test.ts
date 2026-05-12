import { describe, expect, test } from "bun:test";

import * as api from "./index.js";

describe("public api", () => {
	test("exports the Minimap component and helpers", () => {
		expect(typeof api.Minimap).toBe("function");
		expect(typeof api.useSections).toBe("function");
		expect(typeof api.measureWidth).toBe("function");
		expect(typeof api.clearMeasurementCache).toBe("function");
	});
});
