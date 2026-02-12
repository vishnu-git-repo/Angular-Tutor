import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth";
import { firstValueFrom } from "rxjs";

export const AuthGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const auth: any = await firstValueFrom(authService.checkAuth());

    if (!auth?.status) {
      router.navigate(['/login']);
      return false;
    }

    return true;

  } catch (err) {
    console.log(err);
    router.navigate(['/login']);
    return false;
  }
};
