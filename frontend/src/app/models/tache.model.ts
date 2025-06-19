import { Projet } from "./projet.model";
import { User } from "./user.model";
import { Statut } from "../enum/statut.enum";

export interface Tache {
  id: number;
  description: string;
  date?: Date;
  statut: Statut;
  projetId: number;
  projetNom: string;
  assigneeId: number;
  assigneeNom: string;
}


