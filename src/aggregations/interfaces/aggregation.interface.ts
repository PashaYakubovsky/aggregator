export interface Aggregation {
  id: number | string;
  title: string;
  description?: string;
  type: string;
  createdAt: Date;
  from: string;
}
