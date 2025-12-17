# SUPER NINTENDO CLOUD

## Overview
Site de jogos retrô focado em Super Nintendo (SNES) com emulador integrado usando EmulatorJS.

## Current State
- **Frontend**: Completo com design retrô anos 90 (roxo/cinza)
- **Backend**: API para gerenciamento de jogos e upload de ROMs
- **Admin Panel**: Painel em /admin para adicionar jogos via upload
- **Status**: Funcional com jogos locais

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── GameCard.tsx      # Card de jogo individual
│   │   ├── GameGrid.tsx      # Grade de jogos (2 por linha)
│   │   ├── Header.tsx        # Cabeçalho com título
│   │   └── Footer.tsx        # Rodapé
│   ├── pages/
│   │   ├── Home.tsx          # Página inicial com lista de jogos
│   │   ├── Play.tsx          # Página do emulador
│   │   └── Admin.tsx         # Painel admin para adicionar jogos
│   └── App.tsx               # Rotas principais
server/
├── routes.ts                 # API para jogos e upload
└── storage.ts                # Interface de armazenamento
shared/
└── schema.ts                 # Schemas para users e games
```

## Games Included (Local)
1. Super Bomberman 4
2. X-Men - Mutant Apocalypse

## Features
- Upload de ROMs via painel admin (/admin)
- Grade de jogos com 2 itens por linha
- Emulador SNES integrado
- Ícone de configurações para acessar admin

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS (tema escuro roxo/cinza)
- EmulatorJS (CDN)
- Express.js (API backend)
- Drizzle ORM (schema)
- Fonte: Press Start 2P (pixelada)

## Known Limitations
- Jogos adicionados via admin são armazenados em memória (não persistem após reinício)
- Para persistência, configurar banco de dados PostgreSQL
