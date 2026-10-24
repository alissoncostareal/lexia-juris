# ⚖️ LexIA Juris — Vade Mecum & Plataforma de Estudos Jurídicos com IA

[![Release](https://img.shields.io/badge/Release-v1.2.3-blue.svg)](https://github.com/alissoncostareal/lexia-juris/releases/tag/v1.2.3)
[![Android APK](https://img.shields.io/badge/Android-APK%20Download-brightgreen.svg)](https://github.com/alissoncostareal/lexia-juris/raw/main/public/leisbr-estudo.apk)
[![Web Platform](https://img.shields.io/badge/Web-GitHub%20Pages-orange.svg)](https://alissoncostareal.github.io/lexia-juris/)
[![LLM Local](https://img.shields.io/badge/Ollama-Qwen%202.5%20(7B)-purple.svg)](https://ollama.ai)

Plataforma editorial limpa e neutra de estudos jurídicos e legislação brasileira com Inteligência Artificial Local (**Ollama + Qwen 2.5 7B**) e fallbacks gratuitos na nuvem (**Groq / Pollinations**), desenhada para **Tablets (Redmi Pad Pro)**, navegadores e smartphones Android, integrada em tempo real com a base oficial de leis em Markdown (`alissonpeixer/leis`).

---

## 📲 Links Rápidos de Download e Acesso

- 📥 **[Baixar APK Android Atualizado (`leisbr-estudo.apk`)](https://github.com/alissoncostareal/lexia-juris/raw/main/public/leisbr-estudo.apk)** *(Versão 1.2.3 assinada com esquemas v1, v2 e v3, renderização validada no DOM)*
- 🏷️ **[Página da Release v1.2.3 no GitHub](https://github.com/alissoncostareal/lexia-juris/releases/tag/v1.2.3)**
- 🌐 **[Abrir Versão Web Direto no Navegador (PWA / GitHub Pages)](https://alissoncostareal.github.io/lexia-juris/)**

> 💡 **Dica de Instalação no Android / Xiaomi HyperOS:**  
> Se o instalador exibir a mensagem *"Atualizando..."* e em seguida *"App não instalado"*, significa que havia uma versão preliminar ou teste anterior instalado no aparelho com assinatura diferente.  
> **Basta desinstalar a versão anterior do tablet/celular antes de abrir o novo APK baixado.** O Android instalará normalmente com sucesso.

---

## ✨ Funcionalidades e Recursos (v1.2.0)

### 🎯 1. Simulador Jurídico Completo & Todas as Bancas
- **Filtro de Bancas Examinadoras:** Permite escolher entre bancas específicas (**Cebraspe, FGV, FCC, Vunesp, Cesgranrio, Quadrix, IBFC, Instituto AOCP**) ou a nova opção **"Todas as bancas (Mistas / Diversas)"**, que gera simulados mesclando os estilos conceituados e sinalizando a banca em cada questão.
- **Até 50 Questões por Simulado:** Quantidade flexível de questões (`3`, `5`, `8`, `10`, `12`, `15`, `20`, `25`, `30`, `40` e até **50 questões** para baterias completas e super maratonas).

### 📚 2. Temas Simultâneos de Estudo
- **Modo Multitemático:** Alternador entre **Tema Único** e **Temas Simultâneos**.
- Permite selecionar múltiplos tópicos concorrentes de estudo (ex.: *Direitos Fundamentais*, *Licitações 14.133*, *Teoria do Crime*, etc.) para gerar um simulado abrangente e balanceado entre os assuntos escolhidos.

### 🚩 3. Gestão de Metas de Estudo por Tema
- **Metas Personalizadas:** Defina quantidade total de questões e meta diária de resolução para cada matéria.
- **Acompanhamento de Desempenho:** Taxa de acertos, contagem de respondidas e barra de progresso visual individual por tema.
- **Modal de Gestão:** Botões de criação de novos temas e edição de metas existentes.

### 🤖 4. IA Local via Ollama na VPS (Uso Fora de Casa)
- Suporte nativo à execução de LLMs locais com **Ollama** executando o modelo **`qwen2.5:7b`** (altíssimo desempenho em língua portuguesa e raciocínio jurídico).
- **Sem Localhost:** Arquitetura que permite ao tablet ou celular conectar-se remotamente ao servidor VPS via 4G, 5G ou Wi-Fi externo através da gaveta lateral de sincronização.
- **Fallback Automático:** Caso a VPS esteja offline, o sistema alterna automaticamente para provedores em nuvem gratuitos (Groq / Pollinations).

### 📖 5. Leitor Limpo & Acervo de Leis em Markdown
- Design neutro (*Paper & Stone*), sem distrações ou poluição visual.
- Catálogo com mais de 24 normas fundamentais compiladas (CF/88, Código Civil, CPC/15, Código Penal, CPP, CLT, CDC, CTN, Lei 14.133/21, Lei 8.112/90, Improbidade, Ficha Limpa, Código Eleitoral, LGPD, etc.).
- Leitura em voz alta natural em português (`pt-BR`) e controle de tamanho da fonte.

---

## 🏗️ Estrutura do Projeto (Frontend e Backend Organizados)

```
leis-estudo-app/
├── backend/                  # Servidor Node.js Express (LLM Hub & Leis)
│   ├── src/
│   │   └── server.mjs        # API RESTful (Ollama local, Catálogo, RAG, Questões)
│   ├── package.json          # Dependências do backend (Express, CORS, Dotenv)
│   ├── Dockerfile            # Containerização isolada do backend
│   └── .env.example          # Configurações de ambiente (Ollama, Portas)
│
├── frontend/                 # Aplicação React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.jsx           # Interface completa de estudo, simulados e metas
│   │   └── main.jsx
│   ├── package.json          # Dependências do frontend
│   └── vite.config.js
│
├── public/                   # Build compilado do frontend servido pelo backend
├── docs/                     # Distribuição estática OTA (GitHub Pages) & APK
├── docker-compose.yml        # Orquestração do Backend Node.js + Ollama Local
├── deploy.sh                 # Script de implantação automatizada em 1 comando na VPS
└── README.md
```

---

## 🚀 Como Subir na VPS (Implantação com IA Local via Ollama)

A arquitetura foi projetada **sem localhost rígido**: todos os containers e clientes comunicam-se via hostnames do Docker e IPs de rede pública/privada.

### Opção 1: Implantação Automatizada em 1 Comando (Recomendado)

Acesse sua VPS via SSH e execute:

```bash
git clone https://github.com/alissoncostareal/lexia-juris.git
cd lexia-juris
chmod +x deploy.sh
./deploy.sh
```

O script `deploy.sh`:
1. Instala o Docker e Docker Compose (caso ainda não estejam instalados).
2. Constrói e inicializa os containers `lexia-backend` e `lexia-ollama`.
3. Baixa automaticamente o modelo **`qwen2.5:7b`** (~4.7 GB).
4. Sincroniza o acervo completo de leis em Markdown.
5. Exibe a URL pública pronta para acesso: `http://<IP_DA_SUA_VPS>:3460`.

---

### Opção 2: Subir Manualmente com Docker Compose

```bash
docker compose up -d --build
docker exec -it lexia-ollama ollama pull qwen2.5:7b
```

---

## 📱 Como Conectar o Tablet / Celular à VPS (Fora de Casa)

1. **Acesso Direto pelo Navegador:**  
   Abra o Chrome/Edge do tablet e acesse `http://<IP_DA_SUA_VPS>:3460`.

2. **Acesso pelo APK Android ou PWA:**  
   - Abra o menu lateral no canto superior direito (ícone ⚙️ ou Nuvem).
   - No campo **Servidor VPS & LLM Local (Ollama)**, insira:  
     `http://<IP_DA_SUA_VPS>:3460`
   - Toque em **Conectar**. O app testará a rota `/api/status` e passará a usar a LLM da VPS para todas as questões e explicações!

---

## ⚙️ Execução Local de Desenvolvimento

```bash
# Iniciar o backend Node.js
npm run backend

# Iniciar o frontend em modo de desenvolvimento (Vite)
npm run frontend:dev

# Compilar o frontend para produção
npm run frontend:build
```
