export interface CompteRendu {
  id: number;
  titre: string;
  description: string;
  filePath: string;
  fileType: 'PHOTO' | 'VIDEO';
  projetId: number;
  projetNom: string;
  createdById: number;
  createdByNom: string;
  createdByPrenom: string;
  createdAt: string;
}
