import { ApplicationError } from "@/protocols";

export function ForbidenError(): ApplicationError {
  return {
    name: "ForbidenError",
    message: "forbiden error ",
  };
}