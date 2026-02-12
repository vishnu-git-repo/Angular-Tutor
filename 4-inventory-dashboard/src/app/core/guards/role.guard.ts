import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth";
import { firstValueFrom } from "rxjs";

export const RoleGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];

  try {
    const auth: any = await firstValueFrom(authService.checkAuth());

    // If auth fails
    if (!auth?.status) {
      router.navigate(['/login']);
      return false;
    }

    const userRole = auth?.data?.role;

    if (userRole !== expectedRole) {
      router.navigate(['']);
      return false;
    }

    return true;

  } catch (err) {
    console.log(err);
    router.navigate(['/login']);
    return false;
  }
};
