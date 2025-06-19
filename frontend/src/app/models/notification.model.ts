export interface Notification {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  userId: number;
  projetId?: number;
  documentId?: number;
  // Add any other properties that might be needed
}
