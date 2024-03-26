"use server";

import format from "pg-format";
import { pool } from "./db";

export async function submitReservation({
  name,
  email,
  seats,
}: {
  name: string;
  email: string;
  seats: { row: number; seat: number }[];
}) {
  await pool.query(
    format(
      "INSERT INTO reservation(name, email, seat_row, seat_number) VALUES %L RETURNING *;",
      seats.map((seat) => [name, email, seat.row, seat.seat])
    )
  );
  return { success: true };
}
