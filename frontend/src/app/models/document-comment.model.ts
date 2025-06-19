export interface DocumentComment {
  id: number;
  document: {
    id: number;
    titre: string;
    description: string;
    date: string;
    contentType: string;
    fileName: string;
    fileSize: number;
    type: string;
  };
  user: {
    id: number;
    nom: string;
    prenom: string | null;
    email: string;
    username: string;
  };
  comment: string;
  createdAt: string;
  updatedAt: string;
} 