import { ApplicationError } from "@/protocols";

export function BookingError(): ApplicationError {
  return {
    name: "BookingError",
    message: "error identifying user booking",
  };
}