# Rate My Movie (Expo + TypeScript)

Aplicativo mobile híbrido desenvolvido com Expo/React Native para gerenciar um catálogo pessoal de filmes assistidos, com avaliação local por usuário.

## Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`, opcional)

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure a chave da TMDb (caso queira alterar a padrão usada em `app.config.ts`):

   ```bash
   setx EXPO_PUBLIC_TMDB_API_KEY "SUA_CHAVE"
   ```

3. Inicie o projeto:

   ```bash
   npm run start
   ```

   Use `npm run android`, `npm run ios` (Mac) ou `npm run web` conforme o destino desejado.

## Funcionalidades

- Cadastro/login local com foto de perfil (galeria ou câmera)
- Busca de filmes via TMDb (pt-BR), com detalhes e sinopse
- Avaliação de filmes (0–5 estrelas) e persistência por usuário
- Lista “Meus Filmes Assistidos” com dados por usuário logado
- Acessibilidade: rótulos, hints, leitores de tela, alvos mínimos

## Estrutura

- `src/navigation` – stacks/tabs da aplicação
- `src/context` – AuthContext + MoviesContext (estado global)
- `src/services` – integração TMDb e AsyncStorage
- `src/screens` – telas (Login, Register, Search, Details, MyWatched, Profile)
- `src/components` – componentes compartilhados (`MovieCard`, `RatingStars`)

## Scripts

- `npm run start` – inicia o Metro Bundler
- `npm run android | ios | web`
- `npm run lint` – checagem ESLint
- `npm run lint:fix` – corrige problemas simples
- `npm run format` / `npm run format:write` – verificação/formatação Prettier

## Testes Manuais Sugeridos

- Fluxo completo de cadastro/login com foto (câmera/galeria)
- Busca e visualização de detalhes, incluindo filmes sem pôster
- Avaliação, atualização e remoção de nota; conferir persistência trocando usuários
- Verificar leitores de tela (TalkBack/VoiceOver) nas telas principais


