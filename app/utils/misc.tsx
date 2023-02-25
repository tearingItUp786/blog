import { format } from "date-fns";

export function dateFormat(date: string) {
  return format(new Date(date), "MMMM dd, yyyy");
}

export function dotFormattedDate(date: string) {
  return format(new Date(date), "d.M.yy");
}
