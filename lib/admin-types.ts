export type AccessEvent = {
  action: string;
  actor: string;
  detail: string;
  id: string;
  role: "Admin" | "User";
  time: string;
};
