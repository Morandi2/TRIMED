export interface Coupon {
  coupon_id: number;
  code: string;
  description?: string;
  type_reduction: string;
  valeur: number;
  date_debut: string;
  date_fin: string;
  utilisation_max?: number;
  actif: boolean;
}

export interface CouponTenant {
  coupon_tenant_id: number;
  coupon_id: number;
  tenant_id: number;
  date_utilisation: string;
}

export interface CouponFormData {
  code: string;
  description?: string;
  type_reduction: string;
  valeur: number;
  date_debut: string;
  date_fin: string;
  utilisation_max?: number;
  actif: boolean;
}

export interface CouponFilters {
  searchTerm: string;
  type: string;
  actif: string;
}

export interface CouponStats {
  total: number;
  actif: number;
  utilise: number;
  expire: number;
}