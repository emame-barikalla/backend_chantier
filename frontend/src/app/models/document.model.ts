import {DocumentType} from '../enum/DocumentType';

export interface Document {
  id: number;
  titre: string;
  description: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  date: Date;
  projetId: number;
  filePath?: string;
}
