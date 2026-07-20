import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class SweetAlert {
  confirmAction(title: string, text: string, confirmButtonText = 'Yes'): Promise<boolean> {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#D51D16',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    }).then((result) => result.isConfirmed);
  }

  confirmDelete(entity: string): Promise<boolean> {
    return this.confirmAction(
      `Delete ${entity}?`,
      'This action cannot be undone.',
      'Yes, delete'
    );
  }

  error(message: string, title = 'Error'): Promise<void> {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#082E67',
    }).then(() => undefined);
  }

  success(message: string, title = 'Success'): Promise<void> {
    return Swal.fire({
      title,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#082E67',
    }).then(() => undefined);
  }
}
