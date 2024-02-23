import { Component } from '@angular/core';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent {
  hobbyEditable = false;
  genderEditable = false;
  birthdateEditable = false;
  nameEditable = false; // Adicionando a variável para controle da edição do nome
  profileLocked = false;
  hobby = 'Gosto de Filmes';
  gender = 'Masculino';
  birthdate = '2000-10-10';
  userName = 'João Silva'; // Inicialize isso com o nome atual do usuário

  // Atualize o método toggleEdit para incluir o nome
  toggleEdit(field: string) {
    switch (field) {
      case 'hobby':
        this.hobbyEditable = !this.hobbyEditable;
        break;
      case 'gender':
        this.genderEditable = !this.genderEditable;
        break;
      case 'birthdate':
        this.birthdateEditable = !this.birthdateEditable;
        break;
      case 'name': // Adicionando case para o nome
        this.nameEditable = !this.nameEditable;
        // Se o campo estiver em modo de edição, focar nele
        if (this.nameEditable) {
          setTimeout(() => (document.getElementById('name') as HTMLInputElement).focus(), 0);
        }
        break;
      default:
        break;
    }
  }

  toggleLock() {
    this.profileLocked = !this.profileLocked;
  }

  // Método para salvar as alterações (opcional)
  saveChanges() {
    // Aqui você pode adicionar a lógica para salvar as alterações no servidor ou onde for necessário
  }

}
