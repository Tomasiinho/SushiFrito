import { describe, expect, it } from "vitest";

import { getKdsPriorityPresentation } from "@/lib/kds-priority";

describe("getKdsPriorityPresentation", () => {
  it("renders green priority below seven minutes", () => {
    expect(getKdsPriorityPresentation(6.9)).toMatchObject({
      tone: "green",
      blink: false,
      label: "A tiempo"
    });
  });

  it("renders yellow priority from seven to twelve minutes", () => {
    expect(getKdsPriorityPresentation(7)).toMatchObject({
      tone: "yellow",
      blink: false,
      label: "Atencion"
    });

    expect(getKdsPriorityPresentation(12)).toMatchObject({
      tone: "yellow",
      blink: false,
      label: "Atencion"
    });
  });

  it("renders blinking red priority after twelve minutes", () => {
    expect(getKdsPriorityPresentation(12.1)).toMatchObject({
      tone: "red",
      blink: true,
      label: "Alta demora"
    });
  });
});
