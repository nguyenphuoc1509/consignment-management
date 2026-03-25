export type Consignor = {
    id: string;
    companyName: string;
    code: string;
    contactPerson: string;
    phone: string;
    email?: string;
    address: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    updatedAt: string;
  };