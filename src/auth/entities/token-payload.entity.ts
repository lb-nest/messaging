import { BillingType } from '../enums/billing-type.enum';
import { RoleType } from '../enums/role-type.enum';

export class TokenPayload {
  id: number;
  email: string;
  project: {
    id: number;
    billing: {
      id: number;
      type: BillingType;
    };
    roles: Array<{
      role: RoleType;
    }>;
  };
}
