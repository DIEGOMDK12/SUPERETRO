# SUPER NINTENDO CLOUD

## Overview
Site de jogos retrô focado em Super Nintendo (SNES) com emulador integrado usando EmulatorJS.

## Current State
- **Frontend**: Completo com design retrô anos 90 (roxo/cinza)
- **Backend**: Proxy para ROMs do Archive.org
- **Status**: Funcional (ROMs dependem da disponibilidade do Archive.org)

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── GameCard.tsx      # Card de jogo individual
│   │   ├── GameGrid.tsx      # Grade de jogos
│   │   ├── Header.tsx        # Cabeçalho com título
│   │   └── Footer.tsx        # Rodapé
│   ├── pages/
│   │   ├── Home.tsx          # Página inicial com lista de jogos
│   │   └── Play.tsx          # Página do emulador
│   └── App.tsx               # Rotas principais
server/
└── routes.ts                 # API proxy para ROMs
```

## Games Included
1. Super Mario World
2. Donkey Kong Country
3. Zelda - A Link to the Past
4. Street Fighter II Turbo

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS (tema escuro roxo/cinza)
- EmulatorJS (CDN)
- Express.js (proxy backend)
- Fonte: Press Start 2P (pixelada)

## Known Limitations
- Archive.org pode retornar 503 durante alta demanda
- ROMs são carregadas via proxy para contornar CORS
