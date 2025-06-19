import { Role } from "./role.model";

export interface User {
  password: string | undefined;
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string; // Kept adresse field
  roles: Role[];
}
