export interface INavigation {
  _id: string;
  label: string;
  link: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
