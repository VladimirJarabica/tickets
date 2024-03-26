"use client";
import { format } from "date-fns/format";
import { revalidatePath } from "next/cache";
import { useState } from "react";
import { Modal } from "./Modal";
import { ReserveSeat } from "./ReserveSeat";
import styles from "./seat.module.scss";

const SEATS = [
  {
    row: 3,
    seats: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    row: 2,
    seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    row: 1,
    seats: [1, 2, 3, 4, 5],
  },
];

export type ReservationSeat = {
  row: number;
  seat: number;
  timestamp?: Date;
  name?: string;
  email?: string;
};

interface HomePageProps {
  reservations: ReservationSeat[];
  admin: boolean;
}

export default function HomePage({ reservations, admin }: HomePageProps) {
  const [state, setState] = useState<"selecting" | "reserving" | "success">(
    "selecting"
  );
  const [selectedSeats, setSelectedSeats] = useState<
    { row: number; seat: number }[]
  >([]);

  const [selectedReservationEmail, setSelectedReservationEmail] = useState<
    string | null
  >(null);

  const selectedReservations = selectedReservationEmail
    ? reservations.filter((r) => r.email === selectedReservationEmail)
    : [];

  return (
    <div className="flex min-h-screen flex-col items-center py-24">
      <div className="z-10 w-full items-center justify-center lg:flex mb-10">
        <p className="fixed left-0 top-0 flex flex-col w-full items-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <div>FS Kysučan - výročie 2024</div>
          <div className="text-sm">Rezervujte si maximálne 2 miesta</div>
        </p>
      </div>

      <div className="flex flex-col items-center">
        {SEATS.map((row) => (
          <div
            key={row.row}
            className={`flex items-center justify-between flex-1 w-full ${
              admin ? "mb-10" : ""
            }`}
          >
            <div className="w-16 mr-5">Rad {row.row}:</div>
            <div className="flex gap-4">
              {row.seats.map((seat) => {
                const reservation = reservations.find(
                  (s) => s.row === row.row && s.seat === seat
                );
                const isReserved = !!reservation;
                const isSelected = selectedSeats.some(
                  (s) => s.row === row.row && s.seat === seat
                );
                const isDisabled =
                  isReserved || (!isSelected && selectedSeats.length >= 2);
                return (
                  <div key={seat} className={styles.seatContainer}>
                    <div
                      className={`${styles.seat} ${
                        isSelected ? styles.selected : ""
                      } ${isDisabled ? styles.disabled : ""}
                      ${isReserved ? styles.reserved : ""}
                      ${admin ? styles.admin : ""}
                      `}
                      onClick={
                        isDisabled && !admin
                          ? undefined
                          : () => {
                              if (isDisabled && admin) {
                                setSelectedReservationEmail(
                                  reservation?.email ?? null
                                );
                                return;
                              }
                              isSelected
                                ? setSelectedSeats((selected) =>
                                    selected.filter(
                                      (s) =>
                                        s.row !== row.row || s.seat !== seat
                                    )
                                  )
                                : setSelectedSeats((s) => [
                                    ...s,
                                    { row: row.row, seat },
                                  ]);
                            }
                      }
                    ></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      {seat}
                    </div>
                    {reservation && (
                      <div className="absolute top-20 text-xs max-w-full overflow-x-auto h-20">
                        <div>{reservation.name}</div>
                        <div>{reservation.email}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div />
          </div>
        ))}
      </div>
      {selectedSeats.length > 0 && (
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setState("reserving")}
            className="rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            Rezervovať vybrané miesta
          </button>
        </div>
      )}
      {state === "reserving" && (
        <ReserveSeat
          seats={selectedSeats}
          onCancel={() => {
            setState("selecting");
            revalidatePath("/", "page");
          }}
          onSuccess={() => setState("success")}
        />
      )}
      {state === "success" && (
        <Modal>
          <div className="px-4 pb-4 pt-5">
            <div>Rezervácia úspešná!</div>
            <div className="text-sm mt-2">Prosím skontrolujte si email</div>
          </div>
        </Modal>
      )}
      {selectedReservationEmail && selectedReservations.length && (
        <Modal>
          <div className="text-sm px-4 pb-4 pt-5">
            <div className="text-base">Rezervácia</div>
            <div className="mt-2">
              Vytvorená:{" "}
              {selectedReservations[0].timestamp
                ? format(selectedReservations[0].timestamp, "dd.MM.yyyy HH:mm")
                : ""}
            </div>
            <div className="mt-2">
              {selectedReservations[0].name}, {selectedReservations[0].email}
            </div>
            {selectedReservations.map((r) => (
              <div key={`${r.seat}-${r.seat}`} className="mt-2">
                Rada {r.row} - sedadlo {r.seat}
              </div>
            ))}
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md  px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-700 sm:w-auto"
              onClick={() => {
                setSelectedReservationEmail(null);
              }}
            >
              Zavrieť
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
