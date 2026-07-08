import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "@/app/page";

test("renderiza la página de inicio", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /to get started, edit the page\.tsx file\./i,
    }),
  ).toBeInTheDocument();
});
