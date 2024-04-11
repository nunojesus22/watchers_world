import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { MovieApiServiceComponent } from '../media/api/movie-api-service/movie-api-service.component';
import { Meta, Title } from '@angular/platform-browser';
import { ChatService } from '../chat/services/chat.service';
import { Message } from '../chat/models/messages';

interface MovieCategory {
  name: string;
  results: any[];
  activeIndex: number;
  media_type: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  categories: MovieCategory[] = [];
  usernameReceiver: string = "";
  messageText: string = "";

  constructor(public authService: AuthenticationService, private chatService: ChatService, private router: Router, private service: MovieApiServiceComponent, private title: Title, private meta: Meta) { }

  ngOnInit(): void {
    this.initCategories();
  }

  /**
 * Envia uma mensagem para um usuário específico.
 * Verifica se o nome do usuário destinatário e a mensagem estão preenchidos antes de enviar.
 * Se a validação passar, cria uma mensagem com os dados fornecidos e a envia através do serviço de chat.
 * Registra no console se a mensagem foi enviada com sucesso ou se ocorreu um erro.
 */
  sendMessage(): void {
    if (!this.usernameReceiver.trim() || !this.messageText.trim()) {
      console.log('Nome do usuário destinatário e mensagem são necessários.');
      return;
    }

    var messageToSent: Message = {
      messageId: undefined,
      sendUsername: this.authService.getLoggedInUserName()!,
      text: this.messageText.trim(),
      sentAt: undefined,
      readAt: undefined
    }

    this.chatService.sendMessage(this.usernameReceiver, messageToSent)
      .then(() => {
        console.log("Mensagem Enviada!"); 
      })
      .catch(error => console.error('Erro ao enviar mensagem:', error));
  }

  initCategories() {
    this.categories = [
      { name: 'Banner', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes em Destaque', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Séries Mais Votadas', results: [], activeIndex: 0, media_type: "tv" },
      { name: 'Filmes de Ação', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes de Aventura', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes de Comédia', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes de Animação', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes Documentários', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes de Ficção Científica', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes de Thriller', results: [], activeIndex: 0, media_type: "movie" },
    ];

    this.fetchMovies();
  } 


  /**
 * Inicializa as categorias de filmes.
 * Define as categorias de filmes com seus respectivos resultados vazios e índice ativo como 0.
 * Em seguida, chama o método para buscar os filmes para preencher as categorias.
 */
  fetchMovies() {
    const fetchMethods = [
      this.service.bannerApiData(),
      this.service.trendingMovieApiData(),
      this.service.fetchTopRatedSeries(),
      this.service.fetchActionMovies(),
      this.service.fetchAdventureMovies(),
      this.service.fetchComedyMovies(),
      this.service.fetchAnimationMovies(),
      this.service.fetchDocumentaryMovies(),
      this.service.fetchScienceFictionMovies(),
      this.service.fetchThrillerMovies(),
    ];

    fetchMethods.forEach((fetchMethod, index) => {
      fetchMethod.subscribe((result) => {
        this.categories[index].results = result.results;
      });
    });
  }

  /**
 * Realiza o logout do usuário e para a conexão do serviço de chat.
 */
  logout() {
    this.authService.logout();
    this.chatService.stopConnection();
  }


  /**
 * Obtém os resultados da categoria especificada.
 * @param categoryName O nome da categoria.
 * @returns Um array com os resultados da categoria.
 */
  getCategoryResults(categoryName: string): any[] {
    const category = this.categories.find(cat => cat.name === categoryName);
    //console.log("category",category);
    return category ? category.results : [];
  }


  /**
 * Obtém o índice ativo da categoria especificada.
 * @param categoryName O nome da categoria.
 * @returns O índice ativo da categoria.
 */
  getCategoryActiveIndex(categoryName: string): number {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category ? category.activeIndex : 0;
  }

  /**
 * Avança para a próxima página de resultados da categoria especificada.
 * @param categoryName O nome da categoria.
 */
  nextCategory(categoryName: string) {
    const category = this.categories.find(cat => cat.name === categoryName);
    if (category) {
      const batchSize = 4; // Defina o tamanho do lote aqui
      const newIndex = category.activeIndex + batchSize;
      category.activeIndex = newIndex >= category.results.length ? 0 : newIndex;
    }
  }

  
/**
 * Retrocede para a página anterior de resultados da categoria especificada.
 * @param categoryName O nome da categoria.
 */
  prevCategory(categoryName: string) {
    const category = this.categories.find(cat => cat.name === categoryName);
    if (category) {
      const batchSize = 4; // Defina o tamanho do lote aqui
      const newIndex = category.activeIndex - batchSize;
      category.activeIndex = newIndex < 0 ? Math.max(0, category.results.length - batchSize) : newIndex;
    }
  }



}
