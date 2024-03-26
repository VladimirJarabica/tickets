import HomePage, { ReservationSeat } from "./HomePage";
import { getReservations } from "./actions";

export default async function Home({
  searchParams,
}: {
  searchParams: { key: string };
}) {
  const isAdmin = searchParams.key === process.env.ADMIN_KEY;

  const reservationsData = await getReservations();

  const reservations = reservationsData.map((row) => ({
    row: row.row,
    seat: row.seat,
    ...(isAdmin
      ? { timestamp: row.timestamp, name: row.name, email: row.email }
      : {}),
  })) as ReservationSeat[];

  return <HomePage reservations={reservations} admin={isAdmin} />;
}
