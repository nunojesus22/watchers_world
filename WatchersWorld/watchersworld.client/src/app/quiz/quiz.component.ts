import { Component,ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { QuizApiService } from '../quiz/quiz-api-service/quiz-api.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public idmedia: any, private service: QuizApiService,private dialogRef: MatDialogRef<QuizComponent>) {}

  question1: any = {};
  question2: any = {
    'display': 'none'
  };
  question3: any = {
    'display': 'none'
  };
  question4: any = {
    'display': 'none'
  };
  question5: any = {
    'display': 'none'
  };

  questionActive: number = 1;

  //Opções escolhidas pelo user ;_;
  option11 = { label: 'Option 1', checked: false };
  option12 = { label: 'Option 2', checked: false };
  option13 = { label: 'Option 3', checked: false };
  option14 = { label: 'Option 3', checked: false };
  option15 = { label: 'Option 3', checked: false };

  option21 = { label: 'Option 1', checked: false };
  option22 = { label: 'Option 2', checked: false };
  option23 = { label: 'Option 3', checked: false };
  option24 = { label: 'Option 3', checked: false };
  option25 = { label: 'Option 3', checked: false };

  option31 = { label: 'Option 1', checked: false };
  option32 = { label: 'Option 2', checked: false };
  option33 = { label: 'Option 3', checked: false };
  option34 = { label: 'Option 3', checked: false };
  option35 = { label: 'Option 3', checked: false };

  option41 = { label: 'Option 1', checked: false };
  option42 = { label: 'Option 2', checked: false };
  option43 = { label: 'Option 3', checked: false };
  option44 = { label: 'Option 3', checked: false };
  option45 = { label: 'Option 3', checked: false };

  option51 = { label: 'Option 1', checked: false };
  option52 = { label: 'Option 2', checked: false };
  option53 = { label: 'Option 3', checked: false };
  option54 = { label: 'Option 3', checked: false };
  option55 = { label: 'Option 3', checked: false };

  @ViewChild('num0') num0!: ElementRef;
  @ViewChild('num1') num1!: ElementRef;
  @ViewChild('num2') num2!: ElementRef;
  @ViewChild('num3') num3!: ElementRef;
  @ViewChild('num4') num4!: ElementRef;
  @ViewChild('num5') num5!: ElementRef;
  @ViewChild('num6') num6!: ElementRef;

  isPrevDisabled = true;
  isNextDisabled = false;

  lastOption: number = 1;

  closeModal() {
    this.dialogRef.close();
  }

  questionNum(divId: number): void { //Mudar de pergunta -> numeros

    let prevIsDisabled = () => (this as any)['num0'].nativeElement.classList.toggle('disabled');
    let nextIsDisabled = () => (this as any)['num6'].nativeElement.classList.toggle('disabled');

    //css dos numeros, pref e next
    if ( (this as any)['num' + divId] ) {

      //prev css
      if(divId < 2 && this.lastOption != 1) {prevIsDisabled();
      }else if(this.lastOption == 1) {prevIsDisabled();}
      //next css
      if(divId > 4 && this.lastOption != 5) {nextIsDisabled();
      }else if(this.lastOption == 5) {nextIsDisabled();}

      //numeros css
      (this as any)['num' + divId].nativeElement.classList.toggle('disabled');
      (this as any)['num' + this.lastOption].nativeElement.classList.toggle('disabled');
      this.lastOption = divId;
    }

    //Mostrar a pergunta atual e esconder o resto

    (this as any)['question' + divId] = {'display': 'block'};
    this.questionActive = divId;

    for (let i = 0; i <= 5; i++) {

      if (i == divId) {continue;}
      (this as any) ['question' + i] = {'display': 'none'};

    }

  }

  questionPrevNext(Numb: number): void { //Mudar de pergunta -> Anterior ou Proximo

    this.questionActive = this.questionActive+Numb;
    if(this.questionActive < 1){this.questionActive = 1;} //Just in case
    if(this.questionActive > 5){this.questionActive = 5;}

    this.questionNum(this.questionActive);

  }

  printCheckboxValues(): void {
    console.log('Checkbox values:', this.option11, this.option21, this.option31);
  }

  /*
  ResetQuiz(): void {
    this.service.resetQuiz(media , this.idmedia,).subscribe(async (result) => {




    });
  }
  */


}
