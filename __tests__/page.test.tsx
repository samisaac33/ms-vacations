import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "@/app/page";

test("renderiza el home de alojamientos vacacionales", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /alojamientos vacacionales en playa y ciudad/i,
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("heading", { name: /casas con piscina en la costa/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/alojamiento en arrecife/i)).toBeInTheDocument();
  expect(screen.getByText(/apartamento ms vacations/i)).toBeInTheDocument();
  expect(screen.getAllByText(/reserva directa/i).length).toBeGreaterThan(0);
});
