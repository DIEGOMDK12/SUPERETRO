# SUPER NINTENDO CLOUD

## Overview
Site de jogos retrô SNS (Super Nintendo) e SNS-64 (Nintendo 64) com emulador integrado usando EmulatorJS.

## Current State
- **Frontend**: Completo com design retrô anos 90 (roxo/cinza)
- **Backend**: API protegida com autenticação por token
- **Admin Panel**: Painel seguro em /admin com login obrigatório
- **Security**: Sistema de autenticação com credenciais via variáveis de ambiente
- **Status**: Funcional com jogos persistentes no PostgreSQL

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
- Sistema de login seguro (credenciais: ADMIN_USERNAME/ADMIN_PASSWORD)
- Upload de ROMs via painel admin protegido (/admin)
- Barra de progresso durante uploads
- Dashboard com estatísticas de jogos
- Grade de jogos com 2 itens por linha
- Emulador SNS e SNS-64 integrado
- Modo fullscreen e otimização mobile
- Cloud saves para jogadores

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS (tema escuro roxo/cinza)
- EmulatorJS (CDN)
- Express.js (API backend)
- Drizzle ORM (schema)
- Fonte: Press Start 2P (pixelada)

## Authentication
- Acesse /login para autenticar
- Credenciais definidas via variáveis de ambiente (ADMIN_USERNAME, ADMIN_PASSWORD)
- Token armazenado no localStorage após login
- Todas as rotas de admin protegidas com Bearer token

## Environment Variables
- ADMIN_USERNAME: Nome de usuário do admin
- ADMIN_PASSWORD: Senha do admin
- DATABASE_URL: URL do PostgreSQL
