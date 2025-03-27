export interface IPayeeResponse {
  id: string;
  name: string;
  organizationId: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  providerInfo?: any;
  tags?: string[];
  payeeDetails?: any;
  contactDetails?: {
    email?: string;
    phoneNumber?: string;
    address?: {
      addressLine1?: string;
      addressLine2?: string;
      addressLine3?: string;
      addressLine4?: string;
      locality?: string;
      region?: string;
      postcode?: string;
      country?: string;
    };
    taxId?: string;
  };
  status?: string;
  searchHashes?: any;
  replacesId?: string;
}
