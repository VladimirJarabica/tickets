import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { submitReservation } from "./actions";
import { Modal } from "./Modal";

const schema = yup
  .object({
    name: yup.string().required("Povinné"),
    email: yup.string().email("Nesprávny formát email").required("Povinné"),
  })
  .required();

export const ReserveSeat = ({
  seats,
  onCancel,
  onSuccess,
}: {
  seats: { row: number; seat: number }[];
  onCancel: () => void;
  onSuccess: () => void;
}) => {
  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(schema),
  });
  const { errors } = formState;

  return (
    <Modal>
      <form
        onSubmit={handleSubmit(async (values) => {
          const response = await submitReservation({ ...values, seats });
          if (response.success) {
            onSuccess();
            return;
          }
          alert(response.message);
        })}
      >
        <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div className="flex flex-col">
            <div className="sm:mt-0 flex my-3 gap-1 ml-1">
              <div className="text-base font-semibold leading-6 ">
                Vybrané sedadlá:{" "}
              </div>
              {seats.map(({ row, seat }, index) => (
                <div key={`${row}-${seat}`}>
                  rad {row} sedadlo {seat}
                  {index !== seats.length - 1 ? ", " : ""}
                </div>
              ))}
            </div>
            <div>
              <hr />
              <div className="mt-2">
                <p className="text-sm p-1">
                  Prosím zadajte vaše meno a email pre rezerváciu.
                </p>
                <input
                  className="mt-2 w-full outline-none bg-gray-900 p-1 border-b"
                  placeholder="meno a priezvisko"
                  {...register("name", { required: true })}
                />
                <p className="text-sm p-1 text-red-400">
                  {errors.name?.message}
                </p>
                <input
                  className="mt-2 w-full outline-none bg-gray-900 p-1 border-b"
                  placeholder="email"
                  {...register("email", { required: true })}
                />
                <p className="text-sm p-1 text-red-400">
                  {errors.email?.message}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 bg-gray-800">
          <button
            type="submit"
            className={`inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto cursor ${
              !formState.isValid ? "opacity-50 pointer-events-none" : null
            }`}
          >
            {formState.isSubmitting ? "Odosielam..." : "Rezervovať"}
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md  px-3 py-2 text-sm font-semibold  shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-700 sm:mt-0 sm:w-auto"
            onClick={onCancel}
          >
            Zrušiť
          </button>
        </div>
      </form>
    </Modal>
  );
};
