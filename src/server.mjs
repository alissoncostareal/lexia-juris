#!/usr/bin/env node
/**
 * Backend LeisBR Estudo — Plataforma de Estudos Jurídicos com IA (Sem Login)
 * Conecta o acervo Markdown (C:\dev\projetos\leis) com motores de LLM Gratuitos:
 *  1. Groq Cloud Free API (llama-3.3-70b-versatile) — pré-configurado automaticamente
 *  2. FreeLLM / Pollinations OpenAI-compatible Free Endpoint (0 chave necessária — fallback automático)
 *  3. Google Gemini Free Tier (opcional via chave nas configurações)
 *
 * Porta padrão: 3460 (http://localhost:3460 e http://192.168.1.102:3460 para o Redmi Pad Pro)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const USER_PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const PORT = parseInt(process.env.PORT || '3460', 10);

const LEIS_REPO_DIR = fs.existsSync('C:\\dev\\projetos\\leis')
  ? 'C:\\dev\\projetos\\leis'
  : 'C:\\Users\\aliss\\.gemini\\antigravity\\scratch\\leis';

// Load GROQ_API_KEY automatically from C:\dev\projetos\unbora\.env if available
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

// Curated Law Catalog mapped to local Markdown files in C:\dev\projetos\leis
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
    description: 'Institui o Código Eleitoral: órgãos da Justiça Eleitoral, alistamento, sistemas eleitorais (majoritário e proporcional), quociente eleitoral e partidário.',
    suggestedTopics: [
      'Sistemas Eleitorais: Sistema Majoritário vs. Proporcional',
      'Quociente Eleitoral, Quociente Partidário e Distribuição das Sobras (Arts. 105 a 113)',
      'Órgãos da Justiça Eleitoral: TSE, TREs, Juízes e Juntas Eleitorais',
      'Nulidades da Votação e Garantias Eleitorais',
      'Crimes Eleitorais e Processo Penal Eleitoral',
    ],
  },
  {
    id: 'lei-eleicoes',
    title: 'Lei das Eleições (Lei nº 9.504/1997)',
    shortName: 'Lei 9.504/97',
    category: 'Direito Eleitoral',
    relPath: 'federal/leis-ordinarias/1997/lei-9504-1997-09-30.md',
    description: 'Normas para as eleições: convenções, registro de candidatos, federações, arrecadação, propaganda eleitoral e condutas vedadas.',
    suggestedTopics: [
      'Coligações, Federações e Convenções Partidárias',
      'Registro de Candidatos e Cotas de Gênero',
      'Propaganda Eleitoral em Geral, na Internet e no Rádio/TV',
      'Condutas Vedadas aos Agentes Públicos em Campanhas Eleitorais (Art. 73)',
    ],
  },
  {
    id: 'partidos-politicos',
    title: 'Lei dos Partidos Políticos (Lei nº 9.096/1995)',
    shortName: 'Lei 9.096/95',
    category: 'Direito Eleitoral',
    relPath: 'federal/leis-ordinarias/1995/lei-9096-1995-09-19.md',
    description: 'Criação, fusão, incorporação e extinção de partidos políticos, fidelidade partidária, fundo partidário e prestação de contas.',
    suggestedTopics: [
      'Criação, Registro e Funcionamento Parlamentar (Cláusula de Barreira)',
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
      'Ação de Impugnação de Registro de Candidatura (AIRC) e AIJE',
    ],
  },
  {
    id: 'licitacoes-14133',
    title: 'Nova Lei de Licitações e Contratos (Lei nº 14.133/2021)',
    shortName: 'Lei 14.133/21',
    category: 'Direito Administrativo',
    relPath: 'federal/leis-ordinarias/2021/lei-14133-2021-04-01.md',
    description: 'Princípios, modalidades de licitação (pregão, concorrência, diálogo competitivo), dispensa, inexigibilidade e contratos administrativos.',
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
      'Regime Disciplinar, Deveres, Proibições e Penalidades (Demissão, Cassação)',
      'Processo Administrativo Disciplinar (PAD) e Sindicância',
    ],
  },
  {
    id: 'improbidade-8429',
    title: 'Lei de Improbidade Administrativa (Lei nº 8.429/1992)',
    shortName: 'Lei 8.429/92',
    category: 'Direito Administrativo',
    relPath: 'federal/leis-ordinarias/1992/lei-8429-1992-06-02.md',
    description: 'Atos de improbidade administrativa (enriquecimento ilícito, lesão ao erário, violação aos princípios), exigência de dolo e sanções.',
    suggestedTopics: [
      'Exigência de Dolo e Exclusão da Modalidade Culposa (Reforma da Lei 14.230)',
      'Enriquecimento Ilícito (Art. 9º), Prejuízo ao Erário (Art. 10) e Princípios (Art. 11)',
      'Penas, Prescrição Intercorrente e Acordo de Não Persecução Cível',
    ],
  },
  {
    id: 'proc-adm-9784',
    title: 'Processo Administrativo Federal (Lei nº 9.784/1999)',
    shortName: 'Lei 9.784/99',
    category: 'Direito Administrativo',
    relPath: 'federal/leis-ordinarias/1999/lei-9784-1999-01-29.md',
    description: 'Normas básicas sobre o processo administrativo: competência, delegação, avocação, anulação, revogação, convalidação e decadência.',
    suggestedTopics: [
      'Delegação e Avocação de Competência (Arts. 11 a 17)',
      'Anulação, Revogação, Convalidação e Prazo Decadencial de 5 Anos (Arts. 53 a 55)',
      'Recursos Administrativos e Prazos',
    ],
  },
  {
    id: 'codigo-civil',
    title: 'Código Civil (Lei nº 10.406/2002)',
    shortName: 'CC/2002',
    category: 'Direito Civil',
    relPath: 'federal/leis-ordinarias/2002/lei-10406-2002-01-10.md',
    description: 'Parte Geral (pessoas, bens, fatos jurídicos, prescrição e decadência), Obrigações, Contratos, Responsabilidade Civil, Coisas, Família e Sucessões.',
    suggestedTopics: [
      'Personalidade, Capacidade e Direitos da Personalidade (Arts. 1º a 21)',
      'Negócio Jurídico, Defeitos (Erro, Dolo, Coação, Lesão, Fraude) e Nulidades',
      'Prescrição vs. Decadência (Arts. 189 a 211)',
      'Responsabilidade Civil Objetiva e Subjetiva (Arts. 186, 187 e 927)',
    ],
  },
  {
    id: 'cpc-2015',
    title: 'Código de Processo Civil (Lei nº 13.105/2015)',
    shortName: 'CPC/2015',
    category: 'Direito Processual Civil',
    relPath: 'federal/leis-ordinarias/2015/lei-13105-2015-03-16.md',
    description: 'Normas fundamentais, jurisdição, competência, tutela provisória (urgência e evidência), procedimento comum, recursos e execução.',
    suggestedTopics: [
      'Tutela Provisória: Urgência (Antecipada e Cautelar) e Evidência (Arts. 294 a 311)',
      'Julgamento Conforme o Estado do Processo e Mérito',
      'Recursos em Espécie: Apelação, Agravo de Instrumento, Embargos e REsp/RE',
    ],
  },
  {
    id: 'codigo-penal',
    title: 'Código Penal (Decreto-Lei nº 2.848/1940)',
    shortName: 'CP/1940',
    category: 'Direito Penal',
    relPath: 'federal/decretos-lei/1940/del-2848-1940-12-07.md',
    description: 'Aplicação da lei penal, teoria do crime, ilicitude, culpabilidade, concurso de pessoas, penas e crimes em espécie (contra a vida, patrimônio, administração).',
    suggestedTopics: [
      'Aplicação da Lei Penal no Tempo e no Espaço (Arts. 1º a 12)',
      'Teoria do Crime: Tipicidade, Excludentes de Ilicitude e Culpabilidade (Arts. 13 a 28)',
      'Crimes contra a Administração Pública: Peculato, Concussão, Corrupção, Prevaricação (Arts. 312 a 337)',
    ],
  },
  {
    id: 'ctn-1966',
    title: 'Código Tributário Nacional (Lei nº 5.172/1966)',
    shortName: 'CTN',
    category: 'Direito Tributário',
    relPath: 'federal/leis-ordinarias/1966/lei-5172-1966-10-25.md',
    description: 'Tributos em espécie, competência tributária, fato gerador, obrigação e crédito tributário, suspensão, extinção e exclusão.',
    suggestedTopics: [
      'Conceito de Tributo e Espécies Tributárias (Arts. 3º a 5º)',
      'Suspensão, Extinção e Exclusão do Crédito Tributário (Arts. 151, 156 e 175)',
      ' Garantias, Privilégios e Certidões Negativas',
    ],
  },
  {
    id: 'clt-1943',
    title: 'Consolidação das Leis do Trabalho — CLT (DL nº 5.452/1943)',
    shortName: 'CLT',
    category: 'Direito do Trabalho',
    relPath: 'federal/decretos-lei/1943/del-5452-1943-05-01.md',
    description: 'Relação de emprego, jornada de trabalho, férias, remuneração, alteração, suspensão, interrupção e rescisão contratual.',
    suggestedTopics: [
      'Requisitos da Relação de Emprego e Grupo Econômico (Arts. 2º e 3º)',
      'Duração do Trabalho, Horas Extras e Intervalos (Arts. 58 a 75)',
      'Rescisão do Contrato de Trabalho e Justa Causa (Art. 482)',
    ],
  },
  {
    id: 'cdc-1990',
    title: 'Código de Defesa do Consumidor (Lei nº 8.078/1990)',
    shortName: 'CDC',
    category: 'Direito do Consumidor',
    relPath: 'federal/leis-ordinarias/1990/lei-8078-1990-09-11.md',
    description: 'Direitos básicos do consumidor, responsabilidade pelo fato e pelo vício do produto/serviço, práticas comerciais e proteção contratual.',
    suggestedTopics: [
      'Conceito de Consumidor, Fornecedor e Direitos Básicos (Arts. 2º, 3º e 6º)',
      'Responsabilidade pelo Fato vs. Vício do Produto e do Serviço (Arts. 12 a 25)',
      'Decadência e Prescrição no CDC (Arts. 26 e 27)',
    ],
  },
  {
    id: 'lgpd-2018',
    title: 'Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018)',
    shortName: 'LGPD',
    category: 'Direito Digital',
    relPath: 'federal/leis-ordinarias/2018/lei-13709-2018-08-14.md',
    description: 'Fundamentos, bases legais de tratamento de dados pessoais e sensíveis, direitos dos titulares, agentes de tratamento (Controlador, Operador, DPO) e sanções da ANPD.',
    suggestedTopics: [
      'Conceitos: Dado Pessoal, Dado Sensível, Anonimizado e Agentes de Tratamento (Art. 5º)',
      'As 10 Bases Legais para Tratamento de Dados Pessoais (Art. 7º) e Dados Sensíveis (Art. 11)',
      'Direitos do Titular (Art. 18) e Sanções Administrativas da ANPD (Art. 52)',
    ],
  },
];

function readLawText(relPath) {
  const fullPath = path.join(LEIS_REPO_DIR, ...relPath.split('/'));
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, 'utf8');
  // Strip YAML frontmatter if present
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
}

/**
 * Extracts the most relevant articles/passages from a law Markdown file given a query or topic
 * so the LLM receives the exact literal statutory text (RAG Grounding).
 */
function extractRelevantLawExcerpt(lawText, topicOrSearch = '', maxChars = 14000) {
  if (!lawText) return '';
  if (!topicOrSearch || lawText.length <= maxChars) {
    return lawText.slice(0, maxChars);
  }

  // Check if user mentioned specific article range e.g. "Arts. 105 a 113" or "Art. 5º" or "Art. 37"
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

  // Keyword scoring across chunks of ~1800 chars
  const keywords = topicOrSearch
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !['dos', 'das', 'para', 'com', 'sobre', 'nos', 'nas', 'lei', 'art'].includes(w));

  if (keywords.length === 0) return lawText.slice(0, maxChars);

  const paragraphs = lawText.split(/\n{2,}/);
  const scored = [];
  let currentChunk = '';
  for (const p of paragraphs) {
    if ((currentChunk + '\n\n' + p).length > 1600 && currentChunk) {
      scored.push(currentChunk);
      currentChunk = p;
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n\n${p}` : p;
    }
  }
  if (currentChunk) scored.push(currentChunk);

  const ranked = scored
    .map((chunk, i) => {
      const lower = chunk.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        const occurrences = lower.split(kw).length - 1;
        if (occurrences > 0) score += 10 + Math.min(occurrences * 3, 15);
      }
      return { chunk, score, i };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return lawText.slice(0, maxChars);

  const selected = [];
  let totalLen = 0;
  for (const item of ranked) {
    if (totalLen + item.chunk.length > maxChars) break;
    selected.push(item);
    totalLen += item.chunk.length;
  }
  // Keep original document order
  selected.sort((a, b) => a.i - b.i);
  return selected.map((x) => x.chunk).join('\n\n---\n\n');
}

/**
 * Calls LLM with automatic fallback:
 *  1. Groq Cloud API (llama-3.3-70b-versatile) if key is available
 *  2. Pollinations Free OpenAI-compatible LLM API (https://text.pollinations.ai/openai) — 100% free & keyless
 */
async function callFreeLlm({ systemPrompt, userPrompt, jsonMode = false, customApiKey = '' }) {
  const groqKey = (customApiKey || DEFAULT_GROQ_KEY || '').trim().replace(/^['"]|['"]$/g, '');

  // 1. Try Groq API first (openai/gpt-oss-120b -> qwen/qwen3.8-27b -> openai/gpt-oss-20b)
  if (groqKey) {
    const groqModels = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
    for (const model of groqModels) {
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
        if (jsonMode) {
          body.response_format = { type: 'json_object' };
        }

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
          if (content) return { content, provider: `Groq Free (${model})` };
        }
      } catch (e) {
        console.warn(`Groq model ${model} error:`, e.message);
      }
    }
  }

  throw new Error('Não foi possível obter resposta do provedor de IA.');
}

function readProgress() {
  if (!fs.existsSync(USER_PROGRESS_FILE)) {
    return {
      answeredCount: 0,
      correctCount: 0,
      savedNotes: [],
      wrongQuestions: [],
      byTopic: {},
    };
  }
  try {
    return JSON.parse(fs.readFileSync(USER_PROGRESS_FILE, 'utf8'));
  } catch {
    return { answeredCount: 0, correctCount: 0, savedNotes: [], wrongQuestions: [], byTopic: {} };
  }
}

function writeProgress(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USER_PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 5_000_000) req.destroy();
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // GET /api/catalog
  if (req.method === 'GET' && url.pathname === '/api/catalog') {
    const laws = LAW_CATALOG.map((item) => {
      const fullPath = path.join(LEIS_REPO_DIR, ...item.relPath.split('/'));
      return {
        ...item,
        installed: fs.existsSync(fullPath),
      };
    });
    return sendJson(res, 200, {
      laws,
      progress: readProgress(),
      llmConfigured: Boolean(DEFAULT_GROQ_KEY),
      llmDefaultProvider: DEFAULT_GROQ_KEY ? 'Groq (Llama 3.3 70B) + FreeLLM Fallback' : 'FreeLLM API (Keyless)',
    });
  }

  // GET /api/law/:id?q=...&offset=...
  if (req.method === 'GET' && url.pathname.startsWith('/api/law/')) {
    const id = decodeURIComponent(url.pathname.replace('/api/law/', ''));
    const lawMeta = LAW_CATALOG.find((l) => l.id === id);
    if (!lawMeta) return sendJson(res, 404, { error: 'Lei não encontrada no catálogo.' });

    const text = readLawText(lawMeta.relPath);
    if (!text) return sendJson(res, 404, { error: 'Arquivo da lei não encontrado localmente.' });

    const search = (url.searchParams.get('q') || '').trim();
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const limit = parseInt(url.searchParams.get('limit') || '28000', 10);

    if (search) {
      // Split by articles or paragraphs and return matching sections
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
          i += 10; // jump forward to avoid overlapping duplicates
          if (matches.length >= 35) break;
        }
      }
      return sendJson(res, 200, {
        law: lawMeta,
        totalLength: text.length,
        search,
        matches,
      });
    }

    return sendJson(res, 200, {
      law: lawMeta,
      totalLength: text.length,
      offset,
      limit,
      content: text.slice(offset, offset + limit),
      hasMore: offset + limit < text.length,
    });
  }

  // POST /api/ai/explain
  if (req.method === 'POST' && url.pathname === '/api/ai/explain') {
    try {
      const body = await parseBody(req);
      const { lawId, topic, customExcerpt, customApiKey } = body;
      const lawMeta = LAW_CATALOG.find((l) => l.id === lawId) || LAW_CATALOG[0];
      const fullLawText = readLawText(lawMeta.relPath) || '';
      const statutoryContext = customExcerpt
        ? String(customExcerpt).slice(0, 12000)
        : extractRelevantLawExcerpt(fullLawText, topic || lawMeta.title, 13000);

      const systemPrompt = `Você é um Professor Doutor em Direito Brasileiro e Preparação para Concursos e Provas Jurídicas.
Sua missão é ensinar o aluno com clareza cirúrgica, didática visual em Markdown e fundamentação ESTRITA no texto da lei fornecido abaixo.
Sempre cite os artigos, parágrafos e incisos exatos da lei. Nunca invente dispositivos legais.`;

      const userPrompt = `LEI DE BASE: ${lawMeta.title} (${lawMeta.shortName})
TEMA OU DISPOSITIVO SOLICITADO PELO ALUNO: "${topic || 'Visão Geral e Pontos Mais Cobrados'}"

TRECHO OFICIAL DA LEI (FONTE PRIMÁRIA):
"""
${statutoryContext}
"""

Elabore uma AULA COMPLETA E ESQUEMATIZADA em Markdown contendo:
1. 🎯 **Resumo Direto ao Ponto**: O que a lei determina sobre este tema em linguagem clara e acessível.
2. 📜 **Análise Artigo por Artigo**: Explicação detalhada dos artigos mais importantes do trecho acima, traduzindo os termos técnicos.
3. ⚖️ **Regra Geral vs. Exceções & Prazos**: Quadro ou lista destacando prazos, quóruns, competências ou exceções legais que despencam em provas.
4. ⚠️ **Pegadinhas Clássicas de Prova (Cebraspe, FGV, FCC)**: Os 3 erros ou trocas de palavras que as bancas mais usam para confundir o candidato neste tema.
5. 💡 **Exemplo Prático / Caso Concreto**: Um exemplo rápido para fixação imediata na memória.`;

      const result = await callFreeLlm({
        systemPrompt,
        userPrompt,
        jsonMode: false,
        customApiKey,
      });

      return sendJson(res, 200, {
        explanation: result.content,
        provider: result.provider,
        lawTitle: lawMeta.title,
        topic: topic || lawMeta.title,
        statutoryPreview: statutoryContext.slice(0, 2500),
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST /api/ai/questions
  if (req.method === 'POST' && url.pathname === '/api/ai/questions') {
    try {
      const body = await parseBody(req);
      const {
        lawId,
        topic,
        customExcerpt,
        questionType = 'multipla_escolha', // 'multipla_escolha' | 'certo_errado'
        bancaStyle = 'FGV / Cebraspe (Concurso & OAB)',
        count = 5,
        customApiKey,
      } = body;

      const lawMeta = LAW_CATALOG.find((l) => l.id === lawId) || LAW_CATALOG[0];
      const fullLawText = readLawText(lawMeta.relPath) || '';
      const statutoryContext = customExcerpt
        ? String(customExcerpt).slice(0, 12000)
        : extractRelevantLawExcerpt(fullLawText, topic || lawMeta.title, 13000);

      const numQuestions = Math.min(Math.max(parseInt(count, 10) || 5, 1), 10);

      const systemPrompt = `Você é um Examinador Sênior de Bancas de Concursos Públicos Brasileiros (Cebraspe, FGV, FCC, Vunesp).
Você cria questões jurídicas inéditas de altíssima qualidade baseadas EXCLUSIVAMENTE no texto legal fornecido.
Retorne APENAS um objeto JSON válido (sem blocos markdown fora do JSON), seguindo estritamente o schema solicitado.`;

      const userPrompt = `LEI DE BASE: ${lawMeta.title} (${lawMeta.shortName})
TEMA FOCO: "${topic || lawMeta.title}"
ESTILO DE BANCA: ${bancaStyle}
FORMATO: ${questionType === 'certo_errado' ? 'Certo ou Errado (2 opções: "Certo" e "Errado")' : 'Múltipla Escolha (5 alternativas: A, B, C, D, E)'}
QUANTIDADE DE QUESTÕES: ${numQuestions}

TEXTO OFICIAL DA LEI PARA FUNDAMENTAÇÃO:
"""
${statutoryContext}
"""

Gere exatamente ${numQuestions} questões inéditas e desafiadoras no seguinte formato JSON:
{
  "questions": [
    {
      "id": "q1",
      "enunciado": "Texto completo do enunciado da questão (pode incluir caso prático ou cobrança direta da lei)...",
      "options": [
        { "letter": "A", "text": "Texto da alternativa..." },
        { "letter": "B", "text": "Texto da alternativa..." }
      ],
      "correctLetter": "A",
      "artigoBase": "Art. X, § Y, inciso Z da ${lawMeta.shortName}",
      "textoLiteralArtigo": "Transcrição curta do trecho exato da lei que responde à questão...",
      "comentarioGabarito": "Explicação didática detalhada dizendo por que a alternativa correta está certa e apontando o erro específico das demais alternativas."
    }
  ]
}
(Nota: Se o formato for Certo ou Errado, use options com letter "C" ("Certo") e "E" ("Errado"), e correctLetter "C" ou "E".)`;

      const result = await callFreeLlm({
        systemPrompt,
        userPrompt,
        jsonMode: true,
        customApiKey,
      });

      // Parse JSON safely
      let parsed = null;
      const rawContent = result.content.trim();
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      }

      if (!parsed || !Array.isArray(parsed.questions)) {
        throw new Error('A IA retornou um formato inesperado. Tente gerar novamente.');
      }

      return sendJson(res, 200, {
        questions: parsed.questions,
        provider: result.provider,
        lawTitle: lawMeta.title,
        topic: topic || lawMeta.title,
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST /api/progress
  if (req.method === 'POST' && url.pathname === '/api/progress') {
    try {
      const body = await parseBody(req);
      const current = readProgress();

      if (typeof body.answeredDelta === 'number') {
        current.answeredCount = (current.answeredCount || 0) + body.answeredDelta;
      }
      if (typeof body.correctDelta === 'number') {
        current.correctCount = (current.correctCount || 0) + body.correctDelta;
      }
      if (body.topicKey) {
        current.byTopic = current.byTopic || {};
        const prev = current.byTopic[body.topicKey] || { answered: 0, correct: 0 };
        current.byTopic[body.topicKey] = {
          answered: prev.answered + (body.answeredDelta || 0),
          correct: prev.correct + (body.correctDelta || 0),
        };
      }
      if (body.saveNote) {
        current.savedNotes = [body.saveNote, ...(current.savedNotes || [])].slice(0, 100);
      }
      if (body.deleteNoteId) {
        current.savedNotes = (current.savedNotes || []).filter((n) => n.id !== body.deleteNoteId);
      }
      if (body.wrongQuestion) {
        current.wrongQuestions = [body.wrongQuestion, ...(current.wrongQuestions || [])].slice(0, 100);
      }

      writeProgress(current);
      return sendJson(res, 200, { progress: current });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // Static files
  let filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.apk': 'application/vnd.android.package-archive',
    '.svg': 'image/svg+xml',
  };

  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`LeisBR Estudo rodando em http://localhost:${PORT} e na rede do Redmi Pad Pro em http://192.168.1.102:${PORT}`);
});
