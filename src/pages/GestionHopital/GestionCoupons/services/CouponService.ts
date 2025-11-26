import { Coupon, CouponTenant, CouponFormData, CouponStats } from '../types/CouponTypes';

class CouponService {
  private coupons: Coupon[] = [];
  private couponTenants: CouponTenant[] = [];
  private nextCouponId = 1;
  private nextCouponTenantId = 1;

  obtenirTousCoupons(): Coupon[] {
    return this.coupons;
  }

  creerCoupon(data: CouponFormData): { success: boolean; coupon?: Coupon; errors?: string[] } {
    try {
      const nouveauCoupon: Coupon = {
        coupon_id: this.nextCouponId++,
        ...data
      };

      this.coupons.push(nouveauCoupon);
      return { success: true, coupon: nouveauCoupon };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la création du coupon'] };
    }
  }

  modifierCoupon(id: number, data: CouponFormData): { success: boolean; coupon?: Coupon; errors?: string[] } {
    try {
      const index = this.coupons.findIndex(c => c.coupon_id === id);
      if (index === -1) {
        return { success: false, errors: ['Coupon non trouvé'] };
      }

      this.coupons[index] = {
        ...this.coupons[index],
        ...data
      };

      return { success: true, coupon: this.coupons[index] };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la modification du coupon'] };
    }
  }

  supprimerCoupon(id: number): { success: boolean; errors?: string[] } {
    try {
      const index = this.coupons.findIndex(c => c.coupon_id === id);
      if (index === -1) {
        return { success: false, errors: ['Coupon non trouvé'] };
      }

      this.coupons.splice(index, 1);
      return { success: true };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la suppression du coupon'] };
    }
  }

  utiliserCoupon(couponId: number, tenantId: number): { success: boolean; errors?: string[] } {
    try {
      const coupon = this.coupons.find(c => c.coupon_id === couponId);
      if (!coupon || !coupon.actif) {
        return { success: false, errors: ['Coupon non valide'] };
      }

      const utilisation: CouponTenant = {
        coupon_tenant_id: this.nextCouponTenantId++,
        coupon_id: couponId,
        tenant_id: tenantId,
        date_utilisation: new Date().toISOString()
      };

      this.couponTenants.push(utilisation);
      return { success: true };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de l\'utilisation du coupon'] };
    }
  }

  obtenirStatistiques(): CouponStats {
    const maintenant = new Date();

    return {
      total: this.coupons.length,
      actif: this.coupons.filter(c => c.actif && new Date(c.date_fin) > maintenant).length,
      utilise: this.couponTenants.length,
      expire: this.coupons.filter(c => new Date(c.date_fin) <= maintenant).length
    };
  }

  obtenirUtilisationsParTenant(tenantId: number): CouponTenant[] {
    return this.couponTenants.filter(ct => ct.tenant_id === tenantId);
  }
}

export const couponService = new CouponService();