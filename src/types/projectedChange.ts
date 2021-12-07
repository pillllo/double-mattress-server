import Category from "./category";

type ProjectedChange = {
  id: string;
  type: string;
  userId: string;
  amount: number;
  currency: string;
  category: Category;
  date: string; // using ISO strings vs integer as they are human readable
  description: string;
  includeAvg?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default ProjectedChange;
