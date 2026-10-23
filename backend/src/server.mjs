#!/usr/bin/env node
/**
 * Backend Node.js — LexIA Juris & LLM Hub (Express ESM)
 * Arquitetura sem localhost (suporta VPS, Docker, IPs de rede local e remota).
 * LLM Local via Ollama (Qwen 2.5 7B) como prioridade 1 com fallback para Groq / Pollinations.
 *
 * Porta padrão: 3460
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.join(__dirname, '..');
const ROOT_DIR = path.join(BACKEND_DIR, '..');

const DATA_DIR = process.env.DATA_DIR || path.join(BACKEND_DIR, 'data');
const USER_PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const PORT = parseInt(process.env.PORT || '3460', 10);

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Localização dos arquivos estáticos compilados do frontend
const PUBLIC_CANDIDATES = [
  process.env.PUBLIC_DIR,
  path.join(BACKEND_DIR, 'public'),
  path.join(ROOT_DIR, 'public'),
  path.join(ROOT_DIR, 'frontend', 'dist'),
].filter(Boolean);

const PUBLIC_DIR = PUBLIC_CANDIDATES.find(d => fs.existsSync(d)) || path.join(BACKEND_DIR, 'public');

// Configuração do Ollama / LLM Local (sem localhost - usa hostname de container ou IP de rede)
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || process.env.LOCAL_LLM_URL || 'http://ollama:11434').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || process.env.LOCAL_LLM_MODEL || 'qwen2.5:7b';

// Diretórios candidatos para o acervo de leis em Markdown
const CANDIDATE_LEIS_DIRS = [
  process.env.LEIS_REPO_DIR,
  path.join(BACKEND_DIR, 'leis'),
  path.join(DATA_DIR, 'leis'),
  path.join(ROOT_DIR, 'leis'),
  'C:\\dev\\projetos\\leis',
  'C:\\Users\\aliss\\.gemini\\antigravity\\scratch\\leis',
].filter(Boolean);

let LEIS_REPO_DIR = CANDIDATE_LEIS_DIRS.find(d => fs.existsSync(d)) || path.join(DATA_DIR, 'leis');

// Carrega chave GROQ automaticamente de variáveis de ambiente ou .env
function loadAutoApiKey() {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY.trim().replace(/^['"]|['"]$/g, '');
  try {
    const envPath = 'C:\\dev\\projetos\\unbora\\.env';
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const m = content.match(/^GROQ_API_KEY\s*=\s*([^\r\n]+)/m);
      if (m && m[1]) return m[1].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {}
  return '';
}

const DEFAULT_GROQ_KEY = loadAutoApiKey();

// Catálogo das principais normas jurídicas brasileiras em Markdown
export const LAW_CATALOG = [
  {
    id: 'cf88',
    title: 'Constituição Federal de 1988',
    shortName: 'CF/1988',
    category: 'Direito Constitucional',
    relPath: 'constituicao.md',
    description: 'Texto constitucional compilado vigente (Direitos Fundamentais, Organização do Estado, Poderes, Tributação).',
    suggestedTopics: [
      'Princípios Fundamentais (Arts. 1º a 4º)',
      'Direitos e Deveres Individuais e Coletivos (Art. 5º)',
      'Direitos Sociais e Nacionalidade (Arts. 6º a 13)',
      'Direitos Políticos e Partidos Políticos (Arts. 14 a 17)',
      'Administração Pública e Servidores (Arts. 37 a 41)',
      'Poder Legislativo e Processo Legislativo (Arts. 44 a 69)',
      'Poder Judiciário e Funções Essenciais à Justiça (Arts. 92 a 135)',
    ],
  },
  {
    id: 'cod-eleitoral',
    title: 'Código Eleitoral (Lei nº 4.737/1965)',
    shortName: 'Cód. Eleitoral',
    category: 'Direito Eleitoral',
    relPath: 'federal/leis-ordinarias/1965/lei-4737-1965-07-15.md',
    description: 'Institui o Código Eleitoral: órgãos da Justiça Eleitoral, alistamento, sistemas eleitorais e quociente eleitoral.',
    suggestedTopics: [
      'Sistemas Eleitorais: Sistema Majoritário vs. Proporcional',
      'Quociente Eleitoral, Quociente Partidário e Distribuição das Sobras (Arts. 105 a 113)',
      'Órgãos da Justiça Eleitoral: TSE, TREs, Juízes e Juntas Eleitorais',
      'Crimes Eleitorais e Processo Penal Eleitoral',
    ],
  },
  {
    id: 'lei-eleicoes',
    title: 'Lei das Eleições (Lei nº 9.504/1997)',
    shortName: 'Lei 9.504/97',
    category: 'Direito Eleitoral',
    relPath: 'federal/leis-ordinarias/1997/lei-9504-1997-09-30.md',
    description: 'Normas para as eleições: convenções, registro de candidatos, propaganda eleitoral e condutas vedadas.',
    suggestedTopics: [
      'Coligações, Federações e Convenções Partidárias',
      'Registro de Candidatos e Cotas de Gênero',
      'Propaganda Eleitoral na Internet e no Rádio/TV',
      'Condutas Vedadas aos Agentes Públicos em Campanhas Eleitorais (Art. 73)',
    ],
  },
  {
    id: 'partidos-politicos',
    title: 'Lei dos Partidos Políticos (Lei nº 9.096/1995)',
    shortName: 'Lei 9.096/95',
    category: 'Direito Eleitoral',
    relPath: 'federal/leis-ordinarias/1995/lei-9096-1995-09-19.md',
    description: 'Criação, fidelidade partidária, fundo partidário e prestação de contas.',
    suggestedTopics: [
      'Criação, Registro e Funcionamento Parlamentar',
      'Filiação e Fidelidade Partidária / Perda de Mandato (Art. 22-A)',
      'Fundo Partidário e Prestação de Contas',
    ],
  },
  {
    id: 'ficha-limpa',
    title: 'Lei de Inelegibilidades / Ficha Limpa (LC nº 64/1990)',
    shortName: 'LC 64/90',
    category: 'Direito Eleitoral',
    relPath: 'federal/leis-complementares/1990/lcp-64-1990-05-18.md',
    description: 'Casos de inelegibilidade, prazos de desincompatibilização e Ação de Investigação Judicial Eleitoral (AIJE).',
    suggestedTopics: [
      'Inelegibilidades Absolutas e Relativas (Art. 1º)',
      'Prazos de Desincompatibilização',
      'AIJE e AIRC',
    ],
  },
  {
    id: 'licitacoes-14133',
    title: 'Nova Lei de Licitações e Contratos (Lei nº 14.133/2021)',
    shortName: 'Lei 14.133/21',
    category: 'Direito Administrativo',
    relPath: 'federal/leis-ordinarias/2021/lei-14133-2021-04-01.md',
    description: 'Modalidades de licitação (pregão, concorrência, diálogo competitivo), dispensa, inexigibilidade e contratos.',
    suggestedTopics: [
      'Modalidades de Licitação e Critérios de Julgamento',
      'Contratação Direta: Inexigibilidade vs. Dispensa de Licitação (Arts. 72 a 75)',
      'Contratos Administrativos, Garantias e Sanções',
    ],
  },
  {
    id: 'lei-8112',
    title: 'Regime Jurídico dos Servidores Federais (Lei nº 8.112/1990)',
    shortName: 'Lei 8.112/90',
    category: 'Direito Administrativo',
    relPath: 'federal/leis-ordinarias/1990/lei-8112-1990-12-11.md',
    description: 'Provimento, vacância, remoção, redistribuição, direitos, vantagens, regime disciplinar e PAD.',
    suggestedTopics: [
      'Formas de Provimento (Nomeação, Readaptação, Reversão, Reintegração, Recondução)',
      'Regime Disciplinar e Penalidades (Demissão, Cassação)',
      'Processo Administrativo Disciplinar (PAD)',
    ],
  },
  {
    id: 'improbidade-8429',
    title: 'Lei de Improbidade Administrativa (Lei nº 8.429/1992)',
    shortName: 'Lei 8.429/92',
    category: 'Direito Administrativo',
    relPath: 'federal/leis-ordinarias/1992/lei-8429-1992-06-02.md',
    description: 'Atos de improbidade, exigência estrita de dolo específico (Lei 14.230/21) e sanções aplicáveis.',
    suggestedTopics: [
      'Espécies de Atos de Improbidade (Arts. 9º, 10 e 11)',
      'Exigência de Dolo Específico (Art. 1º)',
      'Sanções, Perda de Função e Prescrição (Art. 23)',
    ],
  },
  {
    id: 'proc-adm-9784',
    title: 'Processo Administrativo Federal (Lei nº 9.784/1999)',
    shortName: 'Lei 9.784/99',
    category: 'Direito Administrativo',
    relPath: 'federal/leis-ordinarias/1999/lei-9784-1999-01-29.md',
    description: 'Princípios do processo administrativo, competência, delegação, avocação, anulação, revogação e convalidação.',
    suggestedTopics: [
      'Delegação e Avocação de Competência (Arts. 11 a 15)',
      'Anulação, Revogação e Convalidação de Atos (Arts. 53 a 55)',
      'Prazos, Recursos e Decadência Administrativa (Art. 54)',
    ],
  },
  {
    id: 'codigo-civil',
    title: 'Código Civil (Lei nº 10.406/2002)',
    shortName: 'Código Civil',
    category: 'Direito Civil',
    relPath: 'federal/leis-ordinarias/2002/lei-10406-2002-01-10.md',
    description: 'Parte Geral (Pessoas, Bens, Fatos Jurídicos, Prescrição/Decadência) e Parte Especial (Obrigações, Contratos, Família e Sucessões).',
    suggestedTopics: [
      'Capacidade Civil, Personalidade e Direitos da Personalidade (Arts. 1º a 21)',
      'Negócio Jurídico, Validade e Defeitos: Erro, Dolo, Coação, Fraude (Arts. 104 a 184)',
      'Prescrição e Decadência (Arts. 189 a 211)',
      'Inadimplemento das Obrigações e Cláusula Penal (Arts. 389 a 420)',
    ],
  },
  {
    id: 'cpc-2015',
    title: 'Código de Processo Civil (Lei nº 13.105/2015)',
    shortName: 'CPC/2015',
    category: 'Direito Processual Civil',
    relPath: 'federal/leis-ordinarias/2015/lei-13105-2015-03-16.md',
    description: 'Normas fundamentais, tutela provisória, procedimento comum, recursos e execução.',
    suggestedTopics: [
      'Normas Fundamentais e Cooperação Processual (Arts. 1º a 12)',
      'Tutela Provisória: Urgência e Evidência (Arts. 294 a 311)',
      'Teoria Geral dos Recursos e Apelação (Arts. 994 a 1.014)',
      'Agravo de Instrumento e Rol do Art. 1.015',
    ],
  },
  {
    id: 'codigo-penal',
    title: 'Código Penal (Decreto-Lei nº 2.848/1940)',
    shortName: 'Código Penal',
    category: 'Direito Penal',
    relPath: 'federal/decretos-leis/1940/del-2848-1940-12-07.md',
    description: 'Parte Geral e Crimes contra a Pessoa, Patrimônio e Administração Pública.',
    suggestedTopics: [
      'Aplicação da Lei Penal no Tempo e no Espaço (Arts. 1º a 7º)',
      'Teoria do Crime: Tipicidade, Ilicitude e Culpabilidade (Arts. 13 a 25)',
      'Excludentes de Ilicitude (Arts. 23 a 25)',
      'Crimes contra a Administração Pública',
    ],
  },
  {
    id: 'cpp-1941',
    title: 'Código de Processo Penal (Decreto-Lei nº 3.689/1941)',
    shortName: 'CPP/1941',
    category: 'Direito Processual Penal',
    relPath: 'federal/decretos-leis/1941/del-3689-1941-10-03.md',
    description: 'Inquérito policial, ação penal, provas, prisões cautelares (flagrante, preventiva) e nulidades.',
    suggestedTopics: [
      'Inquérito Policial (Arts. 4º a 23)',
      'Ação Penal Pública e Privada (Arts. 24 a 62)',
      'Prisão em Flagrante e Preventiva (Arts. 301 a 319)',
      'Teoria das Provas e Cadeia de Custódia (Arts. 155 a 184)',
    ],
  },
  {
    id: 'ctn-1966',
    title: 'Código Tributário Nacional (Lei nº 5.172/1966)',
    shortName: 'CTN',
    category: 'Direito Tributário',
    relPath: 'federal/leis-ordinarias/1966/lei-5172-1966-10-25.md',
    description: 'Sistema Tributário Nacional, competência, obrigação tributária e crédito tributário.',
    suggestedTopics: [
      'Espécies de Tributos (Arts. 3º a 5º)',
      'Suspensão da Exigibilidade do Crédito Tributário (Art. 151)',
      'Extinção do Crédito: Pagamento, Prescrição e Decadência (Art. 156)',
      'Exclusão do Crédito: Isenção e Anistia (Art. 175)',
    ],
  },
  {
    id: 'clt-1943',
    title: 'Consolidação das Leis do Trabalho (Decreto-Lei nº 5.452/1943)',
    shortName: 'CLT',
    category: 'Direito do Trabalho',
    relPath: 'federal/decretos-leis/1943/del-5452-1943-05-01.md',
    description: 'Relação de emprego, jornada de trabalho, remuneração, férias, rescisão e reforma trabalhista.',
    suggestedTopics: [
      'Requisitos da Relação de Emprego (Arts. 2º e 3º)',
      'Duração do Trabalho e Horas Extras (Arts. 58 a 75)',
      'Rescisão do Contrato e Justa Causa (Art. 482)',
    ],
  },
  {
    id: 'cdc-1990',
    title: 'Código de Defesa do Consumidor (Lei nº 8.078/1990)',
    shortName: 'CDC',
    category: 'Direito do Consumidor',
    relPath: 'federal/leis-ordinarias/1990/lei-8078-1990-09-11.md',
    description: 'Direitos básicos do consumidor, responsabilidade pelo fato e pelo vício do produto/serviço e prazos de decadência.',
    suggestedTopics: [
      'Direitos Básicos do Consumidor (Art. 6º)',
      'Responsabilidade pelo Fato vs. Vício (Arts. 12 a 25)',
      'Decadência e Prescrição (Arts. 26 e 27)',
    ],
  },
  {
    id: 'lgpd-2018',
    title: 'Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)',
    shortName: 'LGPD',
    category: 'Direito Digital',
    relPath: 'federal/leis-ordinarias/2018/lei-13709-2018-08-14.md',
    description: 'Bases legais de tratamento de dados pessoais e sensíveis, direitos dos titulares e sanções administrativas.',
    suggestedTopics: [
      'Conceitos e Agentes de Tratamento (Art. 5º)',
      'Bases Legais para Tratamento de Dados (Art. 7º)',
      'Direitos do Titular (Art. 18)',
    ],
  },
];

// Leitura do texto da lei em Markdown
function readLawText(relPath) {
  for (const dir of [LEIS_REPO_DIR, path.join(DATA_DIR, 'leis'), ...CANDIDATE_LEIS_DIRS]) {
    if (!dir) continue;
    const fullPath = path.join(dir, ...relPath.split('/'));
    if (fs.existsSync(fullPath)) {
      const raw = fs.readFileSync(fullPath, 'utf8');
      return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
    }
  }
  return null;
}

// Sincronização automática em segundo plano para VPS
async function ensureLawsDownloaded() {
  const targetDir = path.join(DATA_DIR, 'leis');
  try {
    fs.mkdirSync(targetDir, { recursive: true });
    for (const law of LAW_CATALOG) {
      const existing = readLawText(law.relPath);
      if (!existing) {
        const localFilePath = path.join(targetDir, ...law.relPath.split('/'));
        try {
          fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
          const url = `https://raw.githubusercontent.com/alissonpeixer/leis/main/${law.relPath}`;
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            fs.writeFileSync(localFilePath, text, 'utf8');
            console.log(`[VPS AutoSync] Acervo sincronizado: ${law.shortName}`);
          }
        } catch (err) {
          console.warn(`[VPS AutoSync] Falha ao sincronizar ${law.relPath}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.warn('[VPS AutoSync] Erro no diretório de leis:', err.message);
  }
}

// Extrai artigos relevantes da lei para passar de contexto à LLM
function extractRelevantLawExcerpt(lawText, topicOrSearch = '', maxChars = 14000) {
  if (!lawText) return '';
  if (!topicOrSearch || lawText.length <= maxChars) {
    return lawText.slice(0, maxChars);
  }

  const rangeMatch = topicOrSearch.match(/Arts?\.?\s*(\d+)[º°]?\s*(?:a|até|-)\s*(\d+)/i);
  if (rangeMatch) {
    const startArt = parseInt(rangeMatch[1], 10);
    const endArt = parseInt(rangeMatch[2], 10);
    const startRegex = new RegExp(`(?:^|\\n)\\s*(?:\\*\\*)?Art\\.\\s*${startArt}(?:[º°\\.-]|\\s)`, 'i');
    const endRegex = new RegExp(`(?:^|\\n)\\s*(?:\\*\\*)?Art\\.\\s*${endArt + 1}(?:[º°\\.-]|\\s)`, 'i');
    const sIdx = lawText.search(startRegex);
    if (sIdx !== -1) {
      const eIdx = lawText.slice(sIdx + 20).search(endRegex);
      const sliceEnd = eIdx !== -1 ? Math.min(sIdx + 20 + eIdx, sIdx + maxChars) : sIdx + maxChars;
      return lawText.slice(sIdx, sliceEnd);
    }
  }

  const singleArtMatch = topicOrSearch.match(/Art\.?\s*(\d+)/i);
  if (singleArtMatch) {
    const artNum = parseInt(singleArtMatch[1], 10);
    const artRegex = new RegExp(`(?:^|\\n)\\s*(?:\\*\\*)?Art\\.\\s*${artNum}(?:[º°\\.-]|\\s)`, 'i');
    const sIdx = lawText.search(artRegex);
    if (sIdx !== -1) {
      return lawText.slice(Math.max(0, sIdx - 200), sIdx + maxChars);
    }
  }

  const keywords = topicOrSearch
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !['dos', 'das', 'para', 'com', 'sobre', 'nos', 'nas', 'lei', 'art'].includes(w));

  if (keywords.length === 0) return lawText.slice(0, maxChars);

  const paragraphs = lawText.split(/\n{2,}/);
  const chunks = [];
  let cur = '';

  for (const p of paragraphs) {
    if (cur.length + p.length > 2000) {
      if (cur) chunks.push(cur);
      cur = p;
    } else {
      cur = cur ? `${cur}\n\n${p}` : p;
    }
  }
  if (cur) chunks.push(cur);

  const ranked = chunks.map((chunk, i) => {
    const lower = chunk.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      const occurrences = (lower.match(new RegExp(kw, 'g')) || []).length;
      score += occurrences * (kw.length > 5 ? 2 : 1);
    }
    return { chunk, score, i };
  });

  ranked.sort((a, b) => b.score - a.score);

  const selected = [];
  let totalLen = 0;
  for (const item of ranked) {
    if (totalLen + item.chunk.length > maxChars) break;
    selected.push(item);
    totalLen += item.chunk.length;
  }
  selected.sort((a, b) => a.i - b.i);
  return selected.map((x) => x.chunk).join('\n\n---\n\n');
}

/**
 * Chamada à LLM (Sem localhost - usa URL configurada ou hostname de container Docker)
 */
async function callFreeLlm({ systemPrompt, userPrompt, jsonMode = false, customApiKey = '' }) {
  // 1. Ollama Local na VPS
  const candidateOllamaUrls = [
    OLLAMA_BASE_URL,
    'http://ollama:11434',
    'http://127.0.0.1:11434',
  ].filter(Boolean);
  const uniqueUrls = Array.from(new Set(candidateOllamaUrls));

  for (const baseUrl of uniqueUrls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 95000);

      const payload = {
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: false,
        format: jsonMode ? 'json' : undefined,
        options: { temperature: 0.3 },
      };

      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const content = data.message?.content;
        if (content) {
          return { content, provider: `Ollama VPS (${OLLAMA_MODEL})` };
        }
      }
    } catch {}
  }

  // 2. Groq Cloud Fallback
  const groqKey = (customApiKey || DEFAULT_GROQ_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  if (groqKey) {
    const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
    for (const model of models) {
      try {
        const body = {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        };
        if (jsonMode) body.response_format = { type: 'json_object' };

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return { content, provider: `Groq Cloud (${model})` };
        }
      } catch {}
    }
  }

  // 3. Pollinations Fallback
  try {
    const res = await fetch('https://text.pollinations.ai/openai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return { content, provider: 'Pollinations Free Fallback' };
    }
  } catch {}

  throw new Error('Nenhum motor de inteligência artificial respondeu no momento.');
}

// Leitura e persistência de progresso
function readProgress() {
  if (!fs.existsSync(USER_PROGRESS_FILE)) {
    return {
      stats: { questionsAnswered: 0, questionsCorrect: 0, topicsStudied: 1, byTheme: {} },
      notes: [],
      savedQuestions: [],
      studyGoals: [],
    };
  }
  try {
    return JSON.parse(fs.readFileSync(USER_PROGRESS_FILE, 'utf8'));
  } catch {
    return { stats: { questionsAnswered: 0, questionsCorrect: 0, topicsStudied: 1, byTheme: {} }, notes: [], savedQuestions: [], studyGoals: [] };
  }
}

function writeProgress(data) {
  try {
    fs.writeFileSync(USER_PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Erro ao salvar progresso:', err.message);
  }
}

// Normalizador de questões
function normalizeQuestion(q, idx, fallbackTopic, fallbackBanca, fallbackLaw) {
  const statement = q.statement || q.enunciado || q.pergunta || '';
  let options = q.options || q.alternativas || [];

  if (Array.isArray(options)) {
    options = options.map((opt, oIdx) => {
      if (typeof opt === 'string') return opt;
      if (opt && typeof opt === 'object') {
        const letter = opt.letter || opt.letra || ['A', 'B', 'C', 'D', 'E'][oIdx];
        const text = opt.text || opt.texto || '';
        return `${letter}) ${text}`;
      }
      return String(opt);
    });
  } else {
    options = [];
  }

  const rawAnswer = q.answer || q.correctLetter || q.gabarito || q.resposta || 'A';
  const answer = String(rawAnswer).trim().charAt(0).toUpperCase();
  const explanation = q.explanation || q.comentarioGabarito || q.fundamentacao || q.justificativa || '';
  const articleRef = q.articleRef || q.artigoBase || q.artigo || '';
  const banca = q.banca || fallbackBanca || 'FGV / Cebraspe';
  const themeTitle = q.themeTitle || fallbackTopic || 'Direito Constitucional';

  return {
    id: q.id || idx + 1,
    statement,
    options,
    answer,
    explanation,
    articleRef,
    banca,
    themeTitle,
    lawTitle: q.lawTitle || fallbackLaw || 'CF/88',
    distractorAnalysis: q.distractorAnalysis || '',
  };
}

// ==============================================================================
// INICIALIZAÇÃO DA APLICAÇÃO EXPRESS (NODE.JS)
// ==============================================================================
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ROTA 1: Status da VPS & LLM
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    app: 'LexIA Juris Node.js Backend',
    version: '1.2.0',
    ollama: {
      url: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
    },
    acervo: {
      totalLeis: LAW_CATALOG.length,
      diretorio: LEIS_REPO_DIR,
    },
    groqConfigured: Boolean(DEFAULT_GROQ_KEY),
  });
});

// ROTA 2: Catálogo de Leis
app.get('/api/catalog', (req, res) => {
  const laws = LAW_CATALOG.map((item) => {
    const fullPath = path.join(LEIS_REPO_DIR, ...item.relPath.split('/'));
    return {
      ...item,
      installed: fs.existsSync(fullPath),
    };
  });

  res.json({
    laws,
    progress: readProgress(),
    llmConfigured: true,
    llmDefaultProvider: `Ollama VPS (${OLLAMA_MODEL})`,
    ollamaModel: OLLAMA_MODEL,
    ollamaUrl: OLLAMA_BASE_URL,
  });
});

// ROTA 3: Leitura e Busca de Lei em Markdown
app.get('/api/law/:id', (req, res) => {
  const { id } = req.params;
  const lawMeta = LAW_CATALOG.find((l) => l.id === id);
  if (!lawMeta) return res.status(404).json({ error: 'Lei não encontrada no catálogo.' });

  const text = readLawText(lawMeta.relPath);
  if (!text) return res.status(404).json({ error: 'Arquivo da lei não encontrado no acervo local.' });

  const search = (req.query.q || '').toString().trim();
  const offset = parseInt(req.query.offset?.toString() || '0', 10);
  const limit = parseInt(req.query.limit?.toString() || '32000', 10);

  if (search) {
    const lines = text.split(/\r?\n/);
    const matches = [];
    const lower = search.toLowerCase();
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(lower)) {
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length, i + 18);
        matches.push({
          line: i + 1,
          text: lines.slice(start, end).join('\n'),
        });
        i += 10;
        if (matches.length >= 35) break;
      }
    }
    return res.json({
      law: lawMeta,
      totalLength: text.length,
      search,
      matches,
    });
  }

  res.json({
    law: lawMeta,
    totalLength: text.length,
    offset,
    limit,
    content: text.slice(offset, offset + limit),
    hasMore: offset + limit < text.length,
  });
});

// ROTA 4: Explicação Didática por IA
app.post('/api/ai/explain', async (req, res) => {
  try {
    const { lawId, topic, articleText, customExcerpt, focus, customApiKey } = req.body;
    const lawMeta = LAW_CATALOG.find((l) => l.id === lawId) || LAW_CATALOG[0];
    const fullLawText = readLawText(lawMeta.relPath) || '';
    const statutoryContext = articleText || customExcerpt || extractRelevantLawExcerpt(fullLawText, topic || lawMeta.title, 13000);

    const systemPrompt = `Você é um Professor Doutor em Direito Brasileiro e Preparação para Concursos Públicos e OAB.
Sua missão é explicar o dispositivo com clareza cirúrgica, didática visual em Markdown e fundamentação estrita no texto da lei fornecido.
Sempre cite os artigos, parágrafos e incisos exatos. Nunca invente regras jurídicas.`;

    const userPrompt = `LEI DE BASE: ${lawMeta.title} (${lawMeta.shortName})
TEMA OU ARTIGO SOLICITADO: "${topic || lawMeta.title}"
${focus ? `FOCO ESPECÍFICO: "${focus}"` : ''}

TEXTO DA LEI:
"""
${statutoryContext}
"""

Elabore uma aula esquematizada em Markdown contendo:
1. 🎯 **Resumo Direto**: Regra geral em linguagem clara.
2. 📜 **Dispositivos Principais**: Análise dos artigos centrais do trecho.
3. ⚖️ **Exceções & Prazos**: Destaques que costumam cair em provas.
4. ⚠️ **Pegadinhas das Bancas**: As armadilhas mais comuns.
5. 💡 **Exemplo Prático**: Caso concreto rápido para fixação.`;

    const result = await callFreeLlm({
      systemPrompt,
      userPrompt,
      jsonMode: false,
      customApiKey,
    });

    res.json({
      explanation: result.content,
      provider: result.provider,
      lawTitle: lawMeta.title,
      topic: topic || lawMeta.title,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROTA 5: Gerador de Questões Inéditas com IA
app.post('/api/ai/questions', async (req, res) => {
  try {
    const {
      lawId,
      topic,
      articleText,
      customExcerpt,
      count = 5,
      difficulty = 'Médio (Concurso/OAB)',
      banca = 'Todas as bancas',
      customApiKey,
    } = req.body;

    const lawMeta = LAW_CATALOG.find((l) => l.id === lawId) || LAW_CATALOG[0];
    const fullLawText = readLawText(lawMeta.relPath) || '';
    const statutoryContext = articleText || customExcerpt || extractRelevantLawExcerpt(fullLawText, topic || lawMeta.title, 13000);
    const numQuestions = Math.min(Math.max(parseInt(count, 10) || 5, 1), 50);

    const isAllBancas = banca === 'Todas as bancas' || banca === 'Todas';
    const bancaDesc = isAllBancas
      ? 'uma comissão mista de bancas examinadoras conceituadas (Cebraspe, FGV, FCC, Vunesp, Cesgranrio, Quadrix, AOCP)'
      : `uma banca examinadora de alto nível (${banca})`;

    const systemPrompt = `Você é ${bancaDesc} de concursos jurídicos e OAB.
Crie questões inéditas baseadas estritamente na legislação brasileira fornecida.
Retorne APENAS um objeto JSON válido no formato estrito:
{
  "topicSummary": "Resumo objetivo e didático dos pontos cobrados neste simulado.",
  "questions": [
    {
      "id": 1,
      "banca": "${isAllBancas ? 'FGV / Cebraspe' : banca}",
      "themeTitle": "${topic || lawMeta.shortName}",
      "articleRef": "Artigo correspondente (ex: Art. 5º, XI)",
      "statement": "Enunciado completo...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": "A",
      "explanation": "Comentário didático e fundamentação...",
      "distractorAnalysis": "Breve análise das alternativas incorretas."
    }
  ]
}`;

    const userPrompt = `Gere exatamente ${numQuestions} questões inéditas nível "${difficulty}" sobre "${topic || lawMeta.title}".
${isAllBancas ? 'Varie o estilo das questões entre as principais bancas examinadoras e indique no campo "banca".' : `Estilo estrito da banca: ${banca}.`}

BASE LEGAL FORNECIDA:
"""
${statutoryContext}
"""`;

    const result = await callFreeLlm({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      customApiKey,
    });

    let parsed = null;
    const raw = result.content.trim();
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    if (!parsed || !Array.isArray(parsed.questions)) {
      throw new Error('A resposta da IA não continha a lista esperada de questões.');
    }

    const normalizedQuestions = parsed.questions.map((q, idx) =>
      normalizeQuestion(q, idx, topic || lawMeta.shortName, banca, lawMeta.shortName)
    );

    res.json({
      topicSummary: parsed.topicSummary || `Simulado sobre ${topic || lawMeta.title}`,
      questions: normalizedQuestions,
      provider: result.provider,
      lawTitle: lawMeta.title,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROTA 6: Progresso do Usuário
app.get('/api/progress', (req, res) => {
  res.json(readProgress());
});

app.post('/api/progress', (req, res) => {
  try {
    const body = req.body || {};
    const current = readProgress();

    if (body.stats) current.stats = { ...(current.stats || {}), ...body.stats };
    if (body.studyGoals) current.studyGoals = body.studyGoals;
    if (body.savedQuestion) {
      current.savedQuestions = [body.savedQuestion, ...(current.savedQuestions || [])].slice(0, 150);
    }
    if (body.note) {
      current.notes = [body.note, ...(current.notes || [])].slice(0, 150);
    }

    writeProgress(current);
    res.json({ ok: true, progress: current });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Servir arquivos estáticos do frontend
app.use(express.static(PUBLIC_DIR));

// Rota de fallback para SPA (compatível com Express v5)
app.use((req, res) => {
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`<h1>LexIA Juris Node.js Backend Ativo</h1><p>Pronto para requisições na porta ${PORT}.</p>`);
  }
});

// Inicialização sem localhost (escuta em todas as interfaces de rede 0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================================`);
  console.log(`⚖️  LexIA Juris — Node.js Backend & LLM Hub (Express)`);
  console.log(`📡 Servidor ativo na porta ${PORT} (0.0.0.0:${PORT})`);
  console.log(`🤖 LLM Engine: Ollama (${OLLAMA_MODEL}) em ${OLLAMA_BASE_URL}`);
  console.log(`========================================================\n`);
  ensureLawsDownloaded().catch((err) => console.warn('[AutoSync Error]:', err.message));
});
