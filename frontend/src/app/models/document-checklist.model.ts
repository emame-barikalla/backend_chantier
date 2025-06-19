export interface ChecklistItem {
  id: number;
  documentId: number;
  description: string;
  isCompleted: boolean;
  completedBy?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChecklist {
  id: number;
  documentId: number;
  items: ChecklistItem[];
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
} 