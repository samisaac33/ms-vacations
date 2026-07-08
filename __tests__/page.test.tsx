import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "@/app/page";

test("renderiza el dashboard de vacaciones", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /planifica tus vacaciones/i,
    }),
  ).toBeInTheDocument();

  expect(screen.getByText(/tu saldo de vacaciones/i)).toBeInTheDocument();
  expect(screen.getByText(/escapada a la costa/i)).toBeInTheDocument();
});
