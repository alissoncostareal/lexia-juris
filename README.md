# ⚖️ LexIA Juris — Vade Mecum & Plataforma de Estudos Jurídicos com IA

Plataforma editorial limpa e neutra de estudos jurídicos e legislação brasileira com Inteligência Artificial Local (**Ollama + Qwen 2.5 7B**) e fallbacks gratuitos na nuvem (**Groq / Pollinations**), desenhada para **Tablets (Redmi Pad Pro)**, navegadores e smartphones Android, integrada com a base oficial de leis em Markdown (`alissonpeixer/leis`).

---

## 🏗️ Estrutura do Projeto (Organizado em Frontend e Backend)

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
├── docs/                     # Distribuição estática OTA (GitHub Pages)
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
3. Baixa automaticamente o modelo **`qwen2.5:7b`** (otimizado para raciocínio jurídico em português).
4. Sincroniza o acervo completo de leis em Markdown.
5. Exibe a URL pública pronta para acesso: `http://<IP_DA_SUA_VPS>:3460`.

---

### Opção 2: Subir Manualmente com Docker Compose

```bash
docker compose up -d --build
docker exec -it lexia-ollama ollama pull qwen2.5:7b
```

---

## 📱 Como Usar no Tablet / Celular Fora de Casa (4G / 5G / Wi-Fi)

1. **Acesso Direto pelo Navegador:**  
   Abra o navegador do seu tablet (Chrome, Edge) e acesse:  
   `http://<IP_DA_SUA_VPS>:3460`

2. **Acesso pelo APK Android ou GitHub Pages:**  
   - Abra o menu lateral no canto superior direito (ícone ⚙️ ou Nuvem).
   - No campo **Servidor VPS & LLM Local (Ollama)**, insira o endereço:  
     `http://<IP_DA_SUA_VPS>:3460`
   - Toque em **Conectar**. O aplicativo testará a conexão com a VPS e passará a direcionar todas as explicações, simuladores e flashcards para o seu modelo local Qwen 2.5 (7B)!

---

## 📲 Download do APK Android (Sem Cabo)

### 👉 **[📥 BAIXAR APK ANDROID (`leisbr-estudo.apk`)](https://github.com/alissoncostareal/lexia-juris/raw/main/public/leisbr-estudo.apk)**
### 👉 **[🌐 ABRIR VERSÃO GITHUB PAGES (OTA)](https://alissoncostareal.github.io/lexia-juris/)**

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
