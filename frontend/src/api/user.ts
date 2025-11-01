import { http } from "../lib/http";

export async function updateUserInstitute(instituteId: string) {
  return http<{ message: string; user: any }>("/user/institute", {
    method: "PATCH",
    body: JSON.stringify({ instituteId }),
  });
}
