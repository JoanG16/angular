// src/app/components/gestion-usuarios/gestion-usuarios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { User, UserResponse, SingleUserResponse } from '../../../interfaces/user.interface';
import { Local, LocalResponse } from '../../../interfaces/locales.interface';
import { UserService } from '../../../services/administrador/user.service';
import { LocalesService } from '../../../services/administrador/locales.service';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css'
})
export class GestionUsuariosComponent implements OnInit {
  users: User[] = [];
  locales: Local[] = [];
  userForm: FormGroup;
  isEditMode = false;
  editingUser: User | null = null;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private localesService: LocalesService
  ) {
    this.userForm = this.fb.group({
      id_user: [null],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['local_owner', [Validators.required]],
      id_local: [null]
    });
  }

  ngOnInit(): void {
    this.getAllUsers();
    this.getLocales();
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      this.onRoleChange(role);
    });
  }

  // --- MÉTODOS DE LECTURA (READ) ---
  getAllUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (response: UserResponse) => {
        this.users = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.errorMessage = 'No se pudo cargar la lista de usuarios.';
        this.isLoading = false;
      }
    });
  }

  getLocales(): void {
    // La corrección está aquí: la respuesta es directamente un array de 'Local'
    this.localesService.getAllLocales().subscribe({
      next: (response: Local[]) => {
        this.locales = response;
      },
      error: (err) => {
        console.error('Error fetching locales:', err);
      }
    });
  }

  // --- MÉTODOS DE CREACIÓN Y ACTUALIZACIÓN (CREATE & UPDATE) ---
  onRoleChange(role: 'admin' | 'local_owner'): void {
    const idLocalControl = this.userForm.get('id_local');
    if (role === 'admin') {
      idLocalControl?.clearValidators();
      idLocalControl?.setValue(null);
    } else {
      idLocalControl?.setValidators([Validators.required]);
    }
    idLocalControl?.updateValueAndValidity();
  }

  saveUser(): void {
    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    if (this.userForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      this.isLoading = false;
      return;
    }

    const { password, confirmPassword } = this.userForm.value;
    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      this.isLoading = false;
      return;
    }

    const userData = { ...this.userForm.value };
    delete userData.confirmPassword;

    if (this.isEditMode) {
      this.userService.updateUser(userData.id_user, userData).subscribe({
        next: (response: SingleUserResponse) => {
          this.handleSuccessResponse(`Usuario "${response.data.username}" actualizado exitosamente.`);
        },
        error: this.handleErrorResponse.bind(this)
      });
    } else {
      this.userService.createUser(userData).subscribe({
        next: (response: SingleUserResponse) => {
          this.handleSuccessResponse(`Usuario "${response.data.username}" creado exitosamente.`);
        },
        error: this.handleErrorResponse.bind(this)
      });
    }
  }

  // --- MÉTODOS DE ELIMINACIÓN (DELETE) ---
  deleteUser(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.isLoading = true;
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.handleSuccessResponse('Usuario eliminado exitosamente.');
        },
        error: this.handleErrorResponse.bind(this)
      });
    }
  }

  // --- MÉTODOS DE FORMULARIO Y ESTADO ---
  editUser(user: User): void {
    this.isEditMode = true;
    this.editingUser = user;
    this.userForm.reset();
    this.userForm.patchValue({
      id_user: user.id_user,
      username: user.username,
      role: user.role,
      id_local: user.id_local || null
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editingUser = null;
    this.userForm.reset({ role: 'local_owner', id_local: null });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
  }

  // --- MÉTODOS AUXILIARES ---
  handleSuccessResponse(message: string): void {
    this.isLoading = false;
    this.successMessage = message;
    this.getAllUsers();
    this.cancelEdit();
  }

  handleErrorResponse(err: any): void {
    this.isLoading = false;
    console.error('Error:', err);
    this.errorMessage = err.error?.message || 'Ocurrió un error inesperado.';
  }

  getLocalName(id_local: number | undefined): string {
    const local = this.locales.find(l => l.id_local === id_local);
    return local ? local.nombre_del_negocio : 'N/A';
  }
}
