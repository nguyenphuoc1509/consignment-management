export type Store = {
  id: string;
  name: string;
  code: string;
  address: string;
  ward?: string;
  district?: string;
  city: string;
  contactPerson: string;
  phone: string;
  email?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
};
