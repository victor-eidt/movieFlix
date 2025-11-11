# MVP Milestones & Aceitação

| Milestone | Escopo | Critérios de Aceitação |
|-----------|--------|------------------------|
| **M1 – Setup & Infra** | Projeto Expo TS, dependências (navegação, AsyncStorage, axios, image picker/camera) e contextos básicos | `npm run start` executa sem erros; `AuthContext`/`MoviesContext` disponíveis; ESLint/Prettier configurados |
| **M2 – Autenticação Local** | Telas Login/Cadastro, hash de senha, persistência de usuários e foto de perfil | Cadastrar novo usuário com foto local; login válido persiste sessão após reinício; mensagens acessíveis em falhas |
| **M3 – Perfil** | Tela de perfil, troca/remoção de foto e logout | Perfil mostra nome/e-mail/foto do usuário logado; botão logout retorna à tela de login; leitores de tela descrevem ações |
| **M4 – Busca TMDb** | SearchScreen, integração TMDb, listagem com `MovieCard` | Buscar título retorna resultados loc. em pt-BR; estados de carregamento e erro acessíveis; navegação para detalhes |
| **M5 – Detalhes & Avaliação** | MovieDetailsScreen, `RatingStars`, persistência por usuário | Ver detalhes (sinopse, runtime, nota TMDb); salvar nota 0–5 cria/atualiza entrada em AsyncStorage; remover nota funciona |
| **M6 – Meus Filmes** | Tela “Meus Filmes Assistidos” filtrada por usuário | Lista exibe apenas filmes avaliados pelo usuário atual; refresco manual recarrega detalhes; mensagens para vazios/erros |
| **M7 – Acessibilidade & QA** | Ajustes finais de a11y, anúncios, alvos mínimos, polimento | Todos botões/campos têm `accessibilityLabel`/`Hint`; TalkBack/VoiceOver navegam sem bloqueios; lint sem erros |


