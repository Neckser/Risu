import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';

import { AuthStore } from '@core/auth/auth.store';

const matchPasswords = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value as string;
  const confirm = group.get('confirm')?.value as string;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TuiButton],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthStore);

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    },
    { validators: matchPasswords },
  );

  readonly loading = this.auth.loading;
  readonly error = this.auth.error;
  readonly disabled = computed(() => this.loading());

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, password } = this.form.getRawValue();
    this.auth.register({ name, email, password });
  }
}
