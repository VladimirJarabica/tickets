"use server";
import format from "pg-format";
import { pool } from "./db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const EmailTemplate = ({
  children,
  seats,
}: {
  children: React.ReactNode;
  seats: { row: number; seat: number }[];
}) => (
  <div>
    {children}
    <br />
    Sedadlá:
    <ul>
      {seats.map((seat) => (
        <li key={`${seat.row}-${seat.seat}`}>
          rad {seat.row}, sedadlo {seat.seat}
        </li>
      ))}
    </ul>
  </div>
);

export const getReservations = async () => {
  const reservationsData = await pool.query("SELECT * FROM reservation;");
  return reservationsData.rows.map((row) => ({
    row: Number(row.seat_row),
    seat: Number(row.seat_number),
    timestamp: row.timestamp,
    name: row.name,
    email: row.email,
  }));
};

export async function submitReservation({
  name,
  email,
  seats,
}: {
  name: string;
  email: string;
  seats: { row: number; seat: number }[];
}) {
  const reservations = await getReservations();

  const existingReservation = seats.some((seat) =>
    reservations.some((r) => r.row === seat.row && r.seat === seat.seat)
  );
  if (existingReservation) {
    return { success: false, message: "Vybrané sedadlo už je rezervované" };
  }

  await pool.query(
    format(
      "INSERT INTO reservation(name, email, seat_row, seat_number) VALUES %L RETURNING *;",
      seats.map((seat) => [name, email, seat.row, seat.seat])
    )
  );

  // Notify admin
  await resend.emails.send({
    from: "Kysučan výročie <onboarding@resend.dev>",
    to: ["vladojarabica@gmail.com"],
    subject: "Hello World",
    react: EmailTemplate({
      children: (
        <div>
          Nová rezervácia: {name}, {email}
        </div>
      ),
      seats,
    }),
  });

  // // Confirm user reservation
  // const res = await resend.emails.send({
  //   from: "Kysučan výročie <onboarding@resend.dev>",
  //   to: [email],
  //   subject: "Hello World",
  //   react: EmailTemplate({
  //     children: <div>Potvrdzujeme rezerváciu</div>,
  //     seats,
  //   }),
  // });

  return { success: true };
}
