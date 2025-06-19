import { Tache } from "./tache.model"
import { Status } from "../enum/status.enum"
import { Category } from "../enum/category.enum"

export interface Projet {
  id: number;
  nom: string;
  dateDebut?: Date; // ISO date string
  dateFin?: Date; // ISO date string
  budget?: number;
  status: Status;
  category: Category;
  taches: Tache[];
}


