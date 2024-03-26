import { useSearchParams } from "next/navigation";
import HomePage, { ReservationSeat } from "./HomePage";
import { pool } from "./db";

export default async function Home({
  searchParams,
}: {
  searchParams: { key: string };
}) {
  const isAdmin = searchParams.key === process.env.ADMIN_KEY;

  const reservationsData = await pool.query("SELECT * FROM reservation;");

  const reservations = reservationsData.rows.map((row) => ({
    row: Number(row.seat_row),
    seat: Number(row.seat_number),
    ...(isAdmin
      ? { timestamp: row.timestamp, name: row.name, email: row.email }
      : {}),
  })) as ReservationSeat[];

  return <HomePage reservations={reservations} admin={isAdmin} />;
}
