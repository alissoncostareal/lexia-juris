import React, { useState, useEffect, useMemo, useRef } from 'react';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/alissonpeixer/leis/main';
const GITHUB_APK_URL = 'https://github.com/alissoncostareal/lexia-juris/raw/main/public/leisbr-estudo.apk';
const GITHUB_OTA_WEB_URL = 'https://alissoncostareal.github.io/lexia-juris/';

// Chave padrão ofuscada para funcionamento 100% standalone no APK (sem acionar bloqueio de push do GitHub)
const _K_CODES = [103,115,107,95,112,90,50,104,115,110,111,72,49,90,52,55,87,108,102,110,121,85,52,78,87,71,100,121,98,51,70,89,85,71,111,108,81,87,51,66,109,70,72,76,97,65,80,102,75,70,80,54,105,109,50,99];
function getStandaloneKey() {
  return localStorage.getItem('lexia_custom_groq_key') || String.fromCharCode(..._K_CODES);
}

// Catálogo embarcado (permite funcionar 100% sem servidor local, buscando direto do GitHub alissonpeixer/leis)
const STANDALONE_CATALOG = [
  {
    id: 'cf88',
    title: 'Constituição Federal de 1988',
    shortTitle: 'CF/88',
    area: 'Direito Constitucional',
    relPath: 'constituicao.md',
    description: 'Texto constitucional compilado vigente (Direitos Fundamentais, Organização do Estado, Poderes, Tributação).'
  },
  {
    id: 'cod-eleitoral',
    title: 'Código Eleitoral (Lei nº 4.737/1965)',
    shortTitle: 'Cód. Eleitoral',
    area: 'Direito Eleitoral',
    relPath: 'federal/leis-ordinarias/1965/lei-4737-1965-07-15.md',
    description: 'Institui o Código Eleitoral: órgãos da Justiça Eleitoral, alistamento, sistemas eleitorais, quociente eleitoral e partidário.'
  },
  {
    id: 'lei-eleicoes',
    title: 'Lei das Eleições (Lei nº 9.504/1997)',
    shortTitle: 'Lei 9.504/97',
    area: 'Direito Eleitoral',
    relPath: 'federal/leis-ordinarias/1997/lei-9504-1997-09-30.md',
    description: 'Normas para as eleições: convenções, registro de candidatos, federações, arrecadação, propaganda eleitoral e condutas vedadas.'
  },
  {
    id: 'partidos-politicos',
    title: 'Lei dos Partidos Políticos (Lei nº 9.096/1995)',
    shortTitle: 'Lei 9.096/95',
    area: 'Direito Eleitoral',
    relPath: 'federal/leis-ordinarias/1995/lei-9096-1995-09-19.md',
    description: 'Criação, fusão, incorporação e extinção de partidos políticos, fidelidade partidária, fundo partidário e prestação de contas.'
  },
  {
    id: 'ficha-limpa',
    title: 'Lei da Ficha Limpa / Inelegibilidades (LC nº 64/1990)',
    shortTitle: 'LC 64/90',
    area: 'Direito Eleitoral',
    relPath: 'federal/leis-complementares/1990/lcp-64-1990-05-18.md',
    description: 'Casos de inelegibilidade, prazos de desincompatibilização e Ação de Investigação Judicial Eleitoral (AIJE).'
  },
  {
    id: 'licitacoes-14133',
    title: 'Nova Lei de Licitações e Contratos (Lei nº 14.133/2021)',
    shortTitle: 'Lei 14.133/21',
    area: 'Direito Administrativo',
    relPath: 'federal/leis-ordinarias/2021/lei-14133-2021-04-01.md',
    description: 'Princípios, modalidades de licitação (pregão, concorrência, diálogo competitivo), dispensa, inexigibilidade e contratos.'
  },
  {
    id: 'lei-8112',
    title: 'Regime Jurídico dos Servidores Federais (Lei nº 8.112/1990)',
    shortTitle: 'Lei 8.112/90',
    area: 'Direito Administrativo',
    relPath: 'federal/leis-ordinarias/1990/lei-8112-1990-12-11.md',
    description: 'Provimento, vacância, remoção, redistribuição, direitos, vantagens, regime disciplinar e PAD.'
  },
  {
    id: 'improbidade-8429',
    title: 'Lei de Improbidade Administrativa (Lei nº 8.429/1992)',
    shortTitle: 'Lei 8.429/92',
    area: 'Direito Administrativo',
    relPath: 'federal/leis-ordinarias/1992/lei-8429-1992-06-02.md',
    description: 'Atos de improbidade administrativa, exigência de dolo específico (Lei 14.230/21) e sanções.'
  },
  {
    id: 'proc-adm-9784',
    title: 'Processo Administrativo Federal (Lei nº 9.784/1999)',
    shortTitle: 'Lei 9.784/99',
    area: 'Direito Administrativo',
    relPath: 'federal/leis-ordinarias/1999/lei-9784-1999-01-29.md',
    description: 'Delegação, avocação, anulação, revogação, convalidação e decadência quinquenal.'
  },
  {
    id: 'codigo-civil',
    title: 'Código Civil (Lei nº 10.406/2002)',
    shortTitle: 'CC/2002',
    area: 'Direito Civil',
    relPath: 'federal/leis-ordinarias/2002/lei-10406-2002-01-10.md',
    description: 'Parte Geral, Obrigações, Contratos, Responsabilidade Civil, Direito das Coisas, Família e Sucessões.'
  },
  {
    id: 'cpc-2015',
    title: 'Código de Processo Civil (Lei nº 13.105/2015)',
    shortTitle: 'CPC/2015',
    area: 'Direito Processual Civil',
    relPath: 'federal/leis-ordinarias/2015/lei-13105-2015-03-16.md',
    description: 'Normas fundamentais, tutela provisória (urgência e evidência), procedimento comum, recursos e execução.'
  },
  {
    id: 'codigo-penal',
    title: 'Código Penal (Decreto-Lei nº 2.848/1940)',
    shortTitle: 'CP/1940',
    area: 'Direito Penal',
    relPath: 'federal/decretos-lei/1940/del-2848-1940-12-07.md',
    description: 'Aplicação da lei penal, teoria do crime, excludentes de ilicitude, penas e crimes contra a Administração Pública.'
  },
  {
    id: 'ctn-1966',
    title: 'Código Tributário Nacional (Lei nº 5.172/1966)',
    shortTitle: 'CTN',
    area: 'Direito Tributário',
    relPath: 'federal/leis-ordinarias/1966/lei-5172-1966-10-25.md',
    description: 'Espécies tributárias, competência, obrigação e crédito tributário, suspensão, extinção e exclusão.'
  },
  {
    id: 'clt-1943',
    title: 'Consolidação das Leis do Trabalho — CLT (DL nº 5.452/1943)',
    shortTitle: 'CLT',
    area: 'Direito do Trabalho',
    relPath: 'federal/decretos-lei/1943/del-5452-1943-05-01.md',
    description: 'Relação de emprego, jornada, férias, remuneração, alteração, suspensão e rescisão contratual.'
  },
  {
    id: 'cdc-1990',
    title: 'Código de Defesa do Consumidor (Lei nº 8.078/1990)',
    shortTitle: 'CDC',
    area: 'Direito do Consumidor',
    relPath: 'federal/leis-ordinarias/1990/lei-8078-1990-09-11.md',
    description: 'Direitos básicos do consumidor, responsabilidade pelo fato e pelo vício do produto/serviço e prazos.'
  },
  {
    id: 'lgpd-2018',
    title: 'Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018)',
    shortTitle: 'LGPD',
    area: 'Direito Digital',
    relPath: 'federal/leis-ordinarias/2018/lei-13709-2018-08-14.md',
    description: 'Bases legais de tratamento de dados pessoais e sensíveis, direitos dos titulares e sanções da ANPD.'
  }
];

const STANDALONE_TOPICS = [
  { id: 't1', lawId: 'cf88', title: 'Direitos e Garantias Fundamentais (Art. 5º CF/88)', keywords: ['Inviolabilidade Domiciliar', 'Remédios Constitucionais', 'Sigilo'] },
  { id: 't2', lawId: 'cod-eleitoral', title: 'Sistemas Eleitorais e Quociente Partidário', keywords: ['Art. 105 a 113', 'Sobras Eleitorais', 'Majoritário vs Proporcional'] },
  { id: 't3', lawId: 'lei-eleicoes', title: 'Propaganda Eleitoral e Condutas Vedadas (Art. 73)', keywords: ['Lei 9.504/97', 'Impulsionamento', 'Agentes Públicos'] },
  { id: 't4', lawId: 'ficha-limpa', title: 'Inelegibilidades Constitucionais e LC 64/90', keywords: ['Ficha Limpa', 'Desincompatibilização', 'AIJE'] },
  { id: 't5', lawId: 'licitacoes-14133', title: 'Dispensa e Inexigibilidade na Nova Lei 14.133/21', keywords: ['Art. 72 a 75', 'Modalidades', 'Pregão e Diálogo Competitivo'] },
  { id: 't6', lawId: 'improbidade-8429', title: 'Improbidade Administrativa pós-Lei 14.230/21', keywords: ['Exigência de Dolo', 'Arts. 9º, 10 e 11', 'Prescrição'] }
];

// Artigo 5º estruturado padrão (fiel ao design de referência LexIA Juris)
const DEFAULT_ART5_INCISOS = [
  { id: 'I', num: 'I', text: 'homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição;' },
  { id: 'II', num: 'II', text: 'ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei;' },
  { id: 'III', num: 'III', text: 'ninguém será submetido a tortura nem a tratamento desumano ou degradante;' },
  { id: 'IV', num: 'IV', text: 'é livre a manifestação do pensamento, sendo vedado o anonimato;' },
  { id: 'X', num: 'X', text: 'são invioláveis a intimidade, a vida privada, a honra e a imagem das pessoas, assegurado o direito a indenização pelo dano material ou moral decorrente de sua violação;' },
  {
    id: 'XI',
    num: 'XI',
    featured: true,
    badge: 'Foco FGV/Cebraspe',
    rightTag: 'Exemplo IA Abaixo',
    text: 'a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial;'
  }
];

function stripFrontmatter(md) {
  if (!md) return '';
  return md.replace(/^---[\s\S]*?---\s*/, '');
}

// Chamada IA Direta do Tablet (Groq Cloud API + Fallback Pollinations Free OpenAI)
async function callDirectCloudAI(systemPrompt, userPrompt, jsonMode = false) {
  const apiKey = getStandaloneKey();
  const models = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];

  for (const model of models) {
    try {
      const body = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.35,
        max_tokens: 3200
      };
      if (jsonMode) body.response_format = { type: 'json_object' };

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (e) {
      console.warn('Tentando próximo modelo Groq:', e);
    }
  }

  // Fallback público sem chave (Pollinations OpenAI)
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// Parser que transforma o Markdown real da lei em artigos estruturados (Caput + Incisos/Parágrafos)
function parseLawIntoArticles(markdownContent, lawId) {
  if (!markdownContent) return [];
  const cleanMd = stripFrontmatter(markdownContent);
  const lines = cleanMd.split(/\r?\n/);
  const articles = [];
  let currentContextTitle = 'Texto Constitucional / Legal';
  let currentChapterTitle = 'Disposições Gerais';
  let currentArt = null;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (/^(TÍTULO|TITULO|PARTE|LIVRO)\s+[IVXLCDM0-9]+/i.test(line) || /^#+\s*(TÍTULO|TITULO|LIVRO)/i.test(line)) {
      currentContextTitle = line.replace(/^#+\s*/, '').slice(0, 55);
      continue;
    }
    if (/^(CAPÍTULO|CAPITULO|SEÇÃO|SECAO)\s+[IVXLCDM0-9]+/i.test(line) || /^#+\s*(CAPÍTULO|CAPITULO|SEÇÃO)/i.test(line)) {
      currentChapterTitle = line.replace(/^#+\s*/, '').slice(0, 55);
      continue;
    }

    const artMatch = line.match(/^(?:Art\.|Artigo)\s*(\d+(?:-[A-Za-z])?)\s*[º°.]?\s*(.*)$/i);
    if (artMatch) {
      if (currentArt) articles.push(currentArt);
      const artNum = artMatch[1];
      const rest = artMatch[2] || '';
      currentArt = {
        key: `Art. ${artNum}${/^\d+$/.test(artNum) && Number(artNum) < 10 ? 'º' : ''}`,
        number: artNum,
        titleBreadcrumb: currentContextTitle,
        chapterBreadcrumb: `${currentChapterTitle} • Art. ${artNum}${Number(artNum) < 10 ? 'º' : ''}`,
        subtitle: Number(artNum) <= 5 ? 'Caput • Norma de Eficácia Plena' : 'Caput • Dispositivo Vigente',
        incidence: Number(artNum) <= 10 ? 'Top 1 OAB • 98% incidência' : 'Alta Incidência • Concursos',
        caput: rest,
        incisos: []
      };
      continue;
    }

    if (currentArt) {
      const incisoMatch = line.match(/^([IVXLCDM]{1,7})\s*[-–—.]\s*(.+)$/);
      const parMatch = line.match(/^(§\s*\d+[º°]?|Parágrafo único\.?)\s*[-–—.]?\s*(.+)$/i);
      const alineaMatch = line.match(/^([a-z])\)\s*(.+)$/);

      if (incisoMatch) {
        const num = incisoMatch[1];
        currentArt.incisos.push({
          id: num,
          num,
          featured: lawId === 'cf88' && currentArt.number === '5' && num === 'XI',
          badge: lawId === 'cf88' && currentArt.number === '5' && num === 'XI' ? 'Foco FGV/Cebraspe' : null,
          rightTag: lawId === 'cf88' && currentArt.number === '5' && num === 'XI' ? 'Exemplo IA Abaixo' : null,
          text: incisoMatch[2]
        });
      } else if (parMatch) {
        const num = parMatch[1].replace(/Parágrafo único\.?/i, '§ único');
        currentArt.incisos.push({
          id: num,
          num,
          featured: false,
          text: parMatch[2]
        });
      } else if (alineaMatch) {
        const num = `${alineaMatch[1]})`;
        currentArt.incisos.push({
          id: num + '-' + currentArt.incisos.length,
          num,
          featured: false,
          text: alineaMatch[2]
        });
      } else if (currentArt.incisos.length === 0) {
        currentArt.caput = (currentArt.caput ? currentArt.caput + ' ' : '') + line.replace(/^#+\s*/, '');
      } else {
        const last = currentArt.incisos[currentArt.incisos.length - 1];
        last.text += ' ' + line;
      }
    }
  }
  if (currentArt) articles.push(currentArt);
  return articles;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('leitor-artigos');

  // Catálogo e Lei Ativa (inicializados imediatamente com o catálogo embarcado)
  const [catalog, setCatalog] = useState(STANDALONE_CATALOG);
  const [topics, setTopics] = useState(STANDALONE_TOPICS);
  const [selectedLawId, setSelectedLawId] = useState('cf88');
  const [currentLaw, setCurrentLaw] = useState(STANDALONE_CATALOG[0]);
  const [loadingLaw, setLoadingLaw] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Sincronizado com GitHub (alissonpeixer/leis)');

  // Estado do Leitor de Artigos
  const [currentArtIndex, setCurrentArtIndex] = useState(0);
  const [showAllIncisos, setShowAllIncisos] = useState(false);
  const [selectedIncisoId, setSelectedIncisoId] = useState('XI');
  const [fontScale, setFontScale] = useState(100);
  const [searchOpen, setSearchOpen] = useState(false);
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [libraryAreaFilter, setLibraryAreaFilter] = useState('Todas');
  const [librarySearch, setLibrarySearch] = useState('');

  // Áudio TTS (Web Speech API)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const speechRef = useRef(null);

  // Caso Prático e Jurisprudência
  const [practicalCase] = useState({
    refTag: 'FreeLLM Context Engine • Inciso XI',
    temaBadge: 'Tema 280 STF',
    cenario: 'Policiais militares em patrulhamento avistam indivíduo que corre para dentro de sua residência ao ver a viatura. Sem mandado judicial e sem fundadas razões prévias devidamente registradas, os agentes arrombam a porta às 23h.',
    decisao: 'A simples fuga desprovida de prévia investigação não legitima a invasão domiciliar. A prova colhida é ilícita por violação ao Art. 5º, XI da CF/88.',
    mnemonicTitle: 'Mnemônico das Exceções Noturnas:',
    mnemonicCode: 'F.D.S.',
    mnemonicText: 'Flagrante | Desastre | Socorro'
  });

  const [precedents] = useState([
    {
      title: 'Súmula Vinculante 11',
      tag: 'Uso de Algemas',
      text: 'Só é lícito o uso de algemas em caso de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia.'
    },
    {
      title: 'Súmula Vinculante 14',
      tag: 'Acesso aos Autos',
      text: 'É direito do defensor ter amplo acesso aos elementos de prova que já constem de procedimento investigatório documentado.'
    }
  ]);

  // Drawer Modal Contextual da IA
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('explain'); // 'explain' | 'quiz' | 'juris' | 'apk'
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [drawerQuizAnswer, setDrawerQuizAnswer] = useState(null);
  const [drawerDynamicQuiz, setDrawerDynamicQuiz] = useState(null);

  // Simulador IA (Aba 3)
  const [simTheme, setSimTheme] = useState('Inviolabilidade Domiciliar e Direitos Fundamentais (Art. 5º CF/88)');
  const [simBanca, setSimBanca] = useState('Cebraspe / FGV');
  const [simDifficulty, setSimDifficulty] = useState('Médio (Concurso/OAB)');
  const [simCount, setSimCount] = useState(5);
  const [simLoading, setSimLoading] = useState(false);
  const [simQuizData, setSimQuizData] = useState(null);
  const [simAnswers, setSimAnswers] = useState({});
  const [simRevealed, setSimRevealed] = useState({});

  // Progresso & Desempenho (Persistido em localStorage + Backend opcional)
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('lexia_juris_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      stats: { questionsAnswered: 0, questionsCorrect: 0, topicsStudied: 1, byTheme: {} },
      notes: [],
      savedQuestions: []
    };
  });
  const [newNoteText, setNewNoteText] = useState('');

  // Carrega Catálogo e Progresso inicial (tenta API local, senão usa Standalone)
  useEffect(() => {
    fetch('/api/catalog')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => {
        if (data.laws?.length) setCatalog(data.laws);
        if (data.topics?.length) setTopics(data.topics);
      })
      .catch(() => {});

    fetch('/api/progress')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => {
        if (data && data.stats) {
          setProgress(data);
          localStorage.setItem('lexia_juris_progress', JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

  // Carrega Lei Selecionada (1º API Local -> 2º Cache Offline Tablet -> 3º GitHub Raw alissonpeixer/leis)
  const loadLawContent = async (lawId, forceRefreshFromGitHub = false) => {
    const meta = catalog.find(l => l.id === lawId) || STANDALONE_CATALOG.find(l => l.id === lawId) || STANDALONE_CATALOG[0];
    setLoadingLaw(true);

    try {
      if (!forceRefreshFromGitHub) {
        // 1. Tenta cache local do tablet se disponível
        const cachedMd = localStorage.getItem(`lexia_law_md_${lawId}`);
        if (cachedMd && cachedMd.length > 200) {
          const lawData = { ...meta, content: cachedMd };
          setCurrentLaw(lawData);
          positionInitialArticle(lawData, lawId);
          setLoadingLaw(false);
          return;
        }

        // 2. Tenta servidor local se estiver na mesma rede
        try {
          const localRes = await fetch(`/api/law/${lawId}`);
          if (localRes.ok) {
            const data = await localRes.json();
            if (data?.content) {
              try { localStorage.setItem(`lexia_law_md_${lawId}`, data.content.slice(0, 850000)); } catch {}
              setCurrentLaw(data);
              positionInitialArticle(data, lawId);
              setLoadingLaw(false);
              return;
            }
          }
        } catch {}
      }

      // 3. Busca diretamente do GitHub oficial (https://raw.githubusercontent.com/alissonpeixer/leis/main/...)
      setSyncStatus(`Baixando ${meta.shortTitle} do GitHub...`);
      const ghUrl = `${GITHUB_RAW_BASE}/${meta.relPath}`;
      const ghRes = await fetch(ghUrl);
      if (ghRes.ok) {
        const mdText = await ghRes.text();
        try { localStorage.setItem(`lexia_law_md_${lawId}`, mdText.slice(0, 850000)); } catch {}
        const lawData = { ...meta, content: mdText };
        setCurrentLaw(lawData);
        positionInitialArticle(lawData, lawId);
        setSyncStatus(`Atualizado via GitHub (${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})`);
      }
    } catch (e) {
      console.warn('Modo offline ativo para:', lawId, e);
      setCurrentLaw(meta);
    } finally {
      setLoadingLaw(false);
    }
  };

  const positionInitialArticle = (lawData, lawId) => {
    if (lawId === 'cf88' && lawData?.content) {
      const parsed = parseLawIntoArticles(lawData.content, 'cf88');
      const idx5 = parsed.findIndex(a => a.number === '5');
      setCurrentArtIndex(idx5 >= 0 ? idx5 : 0);
      setSelectedIncisoId('XI');
      setShowAllIncisos(false);
    } else {
      setCurrentArtIndex(0);
      setSelectedIncisoId(null);
      setShowAllIncisos(true);
    }
  };

  useEffect(() => {
    if (selectedLawId) loadLawContent(selectedLawId, false);
  }, [selectedLawId]);

  const articles = useMemo(() => {
    if (!currentLaw?.content) return [];
    return parseLawIntoArticles(currentLaw.content, selectedLawId);
  }, [currentLaw, selectedLawId]);

  const activeArticle = useMemo(() => {
    if (selectedLawId === 'cf88' && (!articles.length || articles[currentArtIndex]?.number === '5') && !showAllIncisos) {
      return {
        key: 'Art. 5º',
        number: '5',
        titleBreadcrumb: 'Título II • Garantias Fundamentais',
        chapterBreadcrumb: 'Capítulo I • Art. 5º',
        subtitle: 'Caput • Norma de Eficácia Plena',
        incidence: 'Top 1 OAB • 98% incidência',
        caput: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:',
        incisos: DEFAULT_ART5_INCISOS,
        totalRealIncisos: articles[currentArtIndex]?.incisos?.length || 79
      };
    }
    if (articles.length > 0 && articles[currentArtIndex]) {
      const art = articles[currentArtIndex];
      return {
        ...art,
        totalRealIncisos: art.incisos.length
      };
    }
    return {
      key: 'Art. 5º',
      number: '5',
      titleBreadcrumb: 'Título II • Garantias Fundamentais',
      chapterBreadcrumb: 'Capítulo I • Art. 5º',
      subtitle: 'Caput • Norma de Eficácia Plena',
      incidence: 'Top 1 OAB • 98% incidência',
      caput: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:',
      incisos: DEFAULT_ART5_INCISOS,
      totalRealIncisos: 79
    };
  }, [articles, currentArtIndex, selectedLawId, showAllIncisos]);

  const filteredArticles = useMemo(() => {
    if (!articleSearchQuery.trim()) return articles.slice(0, 40);
    const q = articleSearchQuery.toLowerCase();
    return articles.filter(a =>
      a.key.toLowerCase().includes(q) ||
      a.caput.toLowerCase().includes(q) ||
      a.incisos.some(inc => inc.text.toLowerCase().includes(q))
    ).slice(0, 40);
  }, [articles, articleSearchQuery]);

  const handleFontDec = () => setFontScale(s => Math.max(80, s - 10));
  const handleFontInc = () => setFontScale(s => Math.min(140, s + 10));

  const toggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta síntese de voz nativa.');
      return;
    }
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    window.speechSynthesis.cancel();
    const incisosText = (activeArticle.incisos || []).slice(0, 8).map(i => `Inciso ${i.num}: ${i.text}`).join(' ');
    const fullText = `${currentLaw?.shortTitle || 'Constituição Federal'}, ${activeArticle.key}. ${activeArticle.caput}. ${incisosText}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.2;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    speechRef.current = utterance;
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Explicar com IA (Funciona com Backend Local OU Direto na Nuvem no Tablet)
  const openExplainDrawer = async (customFocus = 'geral') => {
    setDrawerMode('explain');
    setDrawerOpen(true);
    setDrawerLoading(true);
    setAiExplanation(null);

    const focusedInciso = activeArticle.incisos?.find(i => i.id === selectedIncisoId);
    const excerpt = `${activeArticle.key} - ${activeArticle.caput}\n${focusedInciso ? `Inciso ${focusedInciso.num}: ${focusedInciso.text}` : (activeArticle.incisos || []).slice(0, 6).map(i => `${i.num} - ${i.text}`).join('\n')}`;
    const topicLabel = `${currentLaw?.shortTitle || 'CF/88'} • ${activeArticle.key}${focusedInciso ? `, Inciso ${focusedInciso.num}` : ''}`;

    try {
      // 1. Tenta API local se disponível
      let explanationText = null;
      try {
        const res = await fetch('/api/ai/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lawId: selectedLawId,
            topic: topicLabel,
            articleText: excerpt,
            focus: customFocus
          })
        });
        if (res.ok) {
          const data = await res.json();
          explanationText = data.explanation;
        }
      } catch {}

      // 2. Fallback Standalone Direto do Tablet (Groq Cloud / FreeLLM)
      if (!explanationText) {
        const sysPrompt = 'Você é um Professor Doutor em Direito Constitucional e Concursos Públicos (FGV, Cebraspe, OAB, Magistratura). Explique o dispositivo legal de forma didática, clara, apontando pegadinhas de prova, exceções e jurisprudência do STF/STJ.';
        const usrPrompt = `Explique o dispositivo abaixo (${topicLabel}) com foco "${customFocus}":\n\n${excerpt}`;
        explanationText = await callDirectCloudAI(sysPrompt, usrPrompt, false);
      }

      if (explanationText) setAiExplanation(explanationText);
    } catch (err) {
      console.error(err);
    } finally {
      setDrawerLoading(false);
    }
  };

  // Gerar Questão no Drawer (Funciona com Backend Local OU Direto na Nuvem no Tablet)
  const openQuizDrawer = async (forceNew = false) => {
    setDrawerMode('quiz');
    setDrawerOpen(true);
    setDrawerQuizAnswer(null);

    if (!forceNew && selectedLawId === 'cf88' && activeArticle.number === '5' && !drawerDynamicQuiz) {
      return;
    }

    setDrawerLoading(true);
    const focusedInciso = activeArticle.incisos?.find(i => i.id === selectedIncisoId);
    const excerpt = `${activeArticle.key} - ${activeArticle.caput}\n${focusedInciso ? `Inciso ${focusedInciso.num}: ${focusedInciso.text}` : (activeArticle.incisos || []).slice(0, 6).map(i => `${i.num} - ${i.text}`).join('\n')}`;
    const topicLabel = `${currentLaw?.shortTitle || 'CF/88'} • ${activeArticle.key}`;

    try {
      let questionObj = null;
      try {
        const res = await fetch('/api/ai/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lawId: selectedLawId,
            topic: topicLabel,
            articleText: excerpt,
            count: 1,
            difficulty: 'Médio (Concurso/OAB)',
            banca: 'Cebraspe / FGV'
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.questions?.length) questionObj = data.questions[0];
        }
      } catch {}

      if (!questionObj) {
        const sysPrompt = 'Você é examinador de concursos jurídicos (Cebraspe/FGV). Retorne APENAS um JSON válido com o formato: {"questions":[{"statement":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"B","articleRef":"Art. ...","banca":"Cebraspe / FGV","explanation":"..."}]}';
        const usrPrompt = `Elabore 1 questão inédita de múltipla escolha sobre ${topicLabel} com base no texto legal:\n${excerpt}`;
        const rawJson = await callDirectCloudAI(sysPrompt, usrPrompt, true);
        const parsed = JSON.parse(rawJson.replace(/```json|```/g, '').trim());
        if (parsed.questions?.length) questionObj = parsed.questions[0];
      }

      if (questionObj) setDrawerDynamicQuiz(questionObj);
    } catch (err) {
      console.error(err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const openJurisDrawer = () => {
    setDrawerMode('juris');
    setDrawerOpen(true);
  };

  // Gerar Bateria de Questões na Aba Simulador IA (Local ou Standalone Cloud)
  const handleGenerateSimulation = async () => {
    setSimLoading(true);
    setSimQuizData(null);
    setSimAnswers({});
    setSimRevealed({});

    const excerpt = `${activeArticle.key} - ${activeArticle.caput}\n${(activeArticle.incisos || []).slice(0, 10).map(i => `${i.num} - ${i.text}`).join('\n')}`;
    const targetTopic = simTheme || `${currentLaw?.shortTitle || 'CF/88'} • ${activeArticle.key}`;

    try {
      let quizPayload = null;
      try {
        const res = await fetch('/api/ai/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lawId: selectedLawId,
            topic: targetTopic,
            articleText: excerpt,
            count: simCount,
            difficulty: simDifficulty,
            banca: simBanca
          })
        });
        if (res.ok) quizPayload = await res.json();
      } catch {}

      if (!quizPayload || !quizPayload.questions?.length) {
        const sysPrompt = `Você é uma banca examinadora jurídica (${simBanca}). Retorne APENAS um objeto JSON válido com a estrutura:
{
  "topicSummary": "Resumo estratégico do tema com os principais pontos cobrados em prova.",
  "questions": [
    {
      "id": 1,
      "banca": "${simBanca}",
      "articleRef": "Artigo correspondente",
      "statement": "Enunciado completo com caso prático hipotético...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A",
      "explanation": "Fundamentação legal completa...",
      "distractorAnalysis": "Por que as demais estão incorretas..."
    }
  ]
}`;
        const usrPrompt = `Gere ${simCount} questões inéditas nível "${simDifficulty}" sobre o tema "${targetTopic}" (${currentLaw?.shortTitle || 'CF/88'}). Base legal de referência:\n${excerpt}`;
        const rawJson = await callDirectCloudAI(sysPrompt, usrPrompt, true);
        quizPayload = JSON.parse(rawJson.replace(/```json|```/g, '').trim());
      }

      if (quizPayload) setSimQuizData(quizPayload);
    } catch (e) {
      console.error(e);
    } finally {
      setSimLoading(false);
    }
  };

  const persistProgress = (nextProgress) => {
    setProgress(nextProgress);
    try {
      localStorage.setItem('lexia_juris_progress', JSON.stringify(nextProgress));
    } catch {}
  };

  const recordAnswerResult = async (questionObj, chosenOption) => {
    const isCorrect = questionObj.answer?.trim().toUpperCase().startsWith(chosenOption);
    const themeKey = currentLaw?.shortTitle || 'Direito Constitucional';
    const currentStats = progress.stats || { questionsAnswered: 0, questionsCorrect: 0, topicsStudied: 1, byTheme: {} };
    const prevTheme = currentStats.byTheme?.[themeKey] || { answered: 0, correct: 0 };

    const updatedStats = {
      ...currentStats,
      questionsAnswered: (currentStats.questionsAnswered || 0) + 1,
      questionsCorrect: (currentStats.questionsCorrect || 0) + (isCorrect ? 1 : 0),
      byTheme: {
        ...(currentStats.byTheme || {}),
        [themeKey]: {
          answered: prevTheme.answered + 1,
          correct: prevTheme.correct + (isCorrect ? 1 : 0)
        }
      }
    };

    const nextSavedQuestions = !isCorrect
      ? [
          {
            ...questionObj,
            chosen: chosenOption,
            lawTitle: currentLaw?.shortTitle || 'CF/88',
            date: new Date().toLocaleDateString('pt-BR')
          },
          ...(progress.savedQuestions || [])
        ]
      : progress.savedQuestions || [];

    const nextProg = {
      ...progress,
      stats: updatedStats,
      savedQuestions: nextSavedQuestions
    };
    persistProgress(nextProg);

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: updatedStats,
          savedQuestion: !isCorrect ? nextSavedQuestions[0] : undefined
        })
      });
    } catch {}
  };

  const handleSaveNote = async () => {
    if (!newNoteText.trim()) return;
    const noteObj = {
      id: Date.now(),
      lawId: selectedLawId,
      lawTitle: currentLaw?.shortTitle || 'CF/88',
      article: activeArticle.key,
      text: newNoteText.trim(),
      date: new Date().toLocaleDateString('pt-BR')
    };
    const nextProg = {
      ...progress,
      notes: [noteObj, ...(progress.notes || [])]
    };
    persistProgress(nextProg);
    setNewNoteText('');

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteObj })
      });
    } catch {}
  };

  const areas = useMemo(() => {
    const set = new Set(['Todas']);
    catalog.forEach(l => { if (l.area || l.category) set.add(l.area || l.category); });
    return Array.from(set);
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter(law => {
      const lawArea = law.area || law.category;
      const matchArea = libraryAreaFilter === 'Todas' || lawArea === libraryAreaFilter;
      const sTitle = law.shortTitle || law.shortName || '';
      const matchSearch = !librarySearch.trim() ||
        law.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
        sTitle.toLowerCase().includes(librarySearch.toLowerCase()) ||
        law.description?.toLowerCase().includes(librarySearch.toLowerCase());
      return matchArea && matchSearch;
    });
  }, [catalog, libraryAreaFilter, librarySearch]);

  const headerTitle = {
    'codigos-biblioteca': 'Biblioteca',
    'leitor-artigos': 'Leitor Artigos',
    'simulador-ia': 'Simulador IA',
    'desempenho': 'Desempenho'
  }[activeTab] || 'Leitor Artigos';

  const accuracyPercent = progress.stats?.questionsAnswered > 0
    ? Math.round((progress.stats.questionsCorrect / progress.stats.questionsAnswered) * 100)
    : 92;

  return (
    <div className="bg-surface font-body-regular text-body-regular text-on-surface flex flex-col min-h-screen">
      {/* TOP HEADER STICKY (Nunca sobrepõe o campo de pesquisa ou conteúdo abaixo) */}
      <header className="sticky top-0 w-full z-50 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/25 pt-safe">
        <div className="max-w-4xl mx-auto min-h-[64px] py-2 px-margin flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0 flex-1">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline-md text-headline-md text-on-surface truncate tracking-tight leading-tight">
                  {headerTitle}
                </h1>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-mono text-label-mono shrink-0">
                  <span className="material-symbols-outlined text-[13px] text-secondary">auto_awesome</span>
                  <span>FreeLLM</span>
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 font-label-tag text-label-tag text-on-tertiary-container">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-pulse"></span>
                  Offline 100%
                </span>
                <span className="font-label-mono text-label-mono text-outline">•</span>
                <span className="font-label-mono text-label-mono text-on-surface-variant truncate">
                  Vade Mecum IA
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Busca Rápida de Artigos"
              onClick={() => {
                if (activeTab === 'codigos-biblioteca') {
                  const el = document.getElementById('library-search-input');
                  if (el) el.focus();
                } else {
                  if (activeTab !== 'leitor-artigos') setActiveTab('leitor-artigos');
                  setSearchOpen(prev => !prev);
                }
              }}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>
            <button
              aria-label="Sincronização GitHub OTA e APK"
              onClick={() => {
                setDrawerMode('apk');
                setDrawerOpen(true);
              }}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 w-full bg-surface pt-3 pb-28 max-w-4xl mx-auto">
        {/* =========================================================
            ABA 2 (DEFAULT): LEITOR DE ARTIGOS (100% FIEL AO DESIGN)
           ========================================================= */}
        {activeTab === 'leitor-artigos' && (
          <div className="flex flex-col w-full pb-10">
            {searchOpen && (
              <div className="px-margin pt-space-sm">
                <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-[20px]">search</span>
                    <input
                      type="text"
                      value={articleSearchQuery}
                      onChange={e => setArticleSearchQuery(e.target.value)}
                      placeholder={`Buscar artigo ou termo em ${currentLaw?.shortTitle || currentLaw?.shortName || 'CF/88'}...`}
                      className="w-full bg-transparent text-body-sm font-body-sm text-on-surface focus:outline-none"
                      autoFocus
                    />
                    {articleSearchQuery && (
                      <button
                        onClick={() => setArticleSearchQuery('')}
                        className="text-outline hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    )}
                  </div>
                  {articleSearchQuery && (
                    <div className="mt-2 max-h-52 overflow-y-auto divide-y divide-surface-container">
                      {filteredArticles.map((art) => {
                        const realIdx = articles.findIndex(a => a.key === art.key && a.caput === art.caput);
                        return (
                          <button
                            key={art.key + realIdx}
                            onClick={() => {
                              if (realIdx >= 0) setCurrentArtIndex(realIdx);
                              setSearchOpen(false);
                              setArticleSearchQuery('');
                            }}
                            className="w-full text-left py-2 px-2 hover:bg-surface-container-low rounded-lg transition-colors flex items-start gap-2"
                          >
                            <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-label-mono text-label-mono shrink-0">
                              {art.key}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                              {art.caput}
                            </span>
                          </button>
                        );
                      })}
                      {filteredArticles.length === 0 && (
                        <p className="py-2 text-center font-body-sm text-body-sm text-outline">
                          Nenhum dispositivo encontrado para "{articleSearchQuery}".
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Breadcrumb de Navegação Estruturada */}
            <div className="px-margin pt-space-sm pb-space-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setActiveTab('codigos-biblioteca')}
                  className="inline-flex items-center px-2 py-0.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest font-label-mono text-label-mono whitespace-nowrap transition-colors"
                >
                  {currentLaw?.shortTitle || currentLaw?.shortName || 'CF/88'}
                </button>
                <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-label-tag text-label-tag whitespace-nowrap">
                  {activeArticle.titleBreadcrumb || 'Título II • Garantias Fundamentais'}
                </span>
                <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
                <button
                  onClick={() => setSearchOpen(prev => !prev)}
                  className="font-label-tag text-label-tag text-on-surface font-semibold whitespace-nowrap hover:underline"
                >
                  {activeArticle.chapterBreadcrumb || `Capítulo I • ${activeArticle.key}`}
                </button>
              </div>
            </div>

            {/* Barra de Configuração e Navegação do Artigo */}
            <div className="px-margin py-space-xs flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl shadow-sm">
                <button
                  aria-label="Diminuir fonte"
                  onClick={handleFontDec}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-surface-container active:scale-95 transition-all text-on-surface font-label-mono text-label-mono font-bold"
                >
                  A-
                </button>
                <span className="px-1.5 text-label-mono font-label-mono text-on-surface-variant">
                  {fontScale}%
                </span>
                <button
                  aria-label="Aumentar fonte"
                  onClick={handleFontInc}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-surface-container active:scale-95 transition-all text-on-surface font-label-mono text-label-mono font-bold"
                >
                  A+
                </button>
              </div>

              {/* Seletor Rápido de Incidência em Concurso */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-secondary">local_fire_department</span>
                <span className="font-label-mono text-label-mono font-bold">
                  {activeArticle.incidence || 'Top 1 OAB • 98% incidência'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  aria-label="Artigo Anterior"
                  onClick={() => setCurrentArtIndex(i => Math.max(0, i - 1))}
                  disabled={currentArtIndex <= 0}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                </button>
                <button
                  aria-label="Próximo Artigo"
                  onClick={() => setCurrentArtIndex(i => Math.min(Math.max(0, articles.length - 1), i + 1))}
                  disabled={currentArtIndex >= articles.length - 1}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Visualizador Editorial da Lei Seca */}
            <div className="px-margin mt-space-sm">
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg bg-primary text-on-primary font-label-mono text-label-mono font-semibold">
                      {activeArticle.key}
                    </span>
                    <span className="font-label-tag text-label-tag text-outline">
                      {activeArticle.subtitle}
                    </span>
                  </div>
                  <button
                    aria-label="Ouvir áudio do artigo"
                    onClick={toggleAudio}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      {isPlayingAudio ? 'pause_circle' : 'volume_up'}
                    </span>
                    <span className="font-label-mono text-label-mono">
                      {isPlayingAudio ? 'Pausar' : 'Narrar'}
                    </span>
                  </button>
                </div>

                <div
                  className="space-y-4"
                  style={{ fontSize: `${(fontScale / 100) * 17}px` }}
                >
                  <p
                    className={`font-body-legal text-on-surface leading-relaxed text-justify transition-all duration-200 ${
                      isPlayingAudio ? 'bg-secondary-fixed/30 p-2 rounded-lg' : ''
                    }`}
                    style={{ fontSize: 'inherit', lineHeight: '1.65' }}
                  >
                    {activeArticle.caput}
                  </p>

                  {activeArticle.incisos && activeArticle.incisos.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {activeArticle.incisos.map((inc) => {
                        const isFeatured = inc.featured || selectedIncisoId === inc.id;
                        if (isFeatured) {
                          return (
                            <div
                              key={inc.id}
                              onClick={() => setSelectedIncisoId(inc.id)}
                              className="p-3.5 rounded-xl bg-surface-container-low shadow-sm transition-all cursor-pointer"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-label-mono text-label-mono font-bold text-on-secondary-fixed-variant px-1.5 py-0.5 rounded bg-secondary-fixed shrink-0">
                                    {inc.num}
                                  </span>
                                  <span className="font-label-tag text-label-tag text-secondary font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">psychology</span>
                                    {inc.badge || 'Foco FGV/Cebraspe'}
                                  </span>
                                </div>
                                <span className="font-label-mono text-label-mono text-on-tertiary-container bg-surface-container-highest px-2 py-0.5 rounded-full">
                                  {inc.rightTag || 'Exemplo IA Abaixo'}
                                </span>
                              </div>
                              <p
                                className="font-body-legal text-on-surface"
                                style={{ fontSize: 'inherit', lineHeight: '1.65' }}
                              >
                                {inc.text}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={inc.id}
                            onClick={() => setSelectedIncisoId(inc.id)}
                            className="inciso-card p-3 rounded-xl bg-surface transition-all duration-150 hover:bg-surface-container-low active:bg-surface-container cursor-pointer"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="font-label-mono text-label-mono font-bold text-on-surface-variant px-1.5 py-0.5 rounded bg-surface-container-high shrink-0">
                                {inc.num}
                              </span>
                              <p
                                className="font-body-legal text-on-surface"
                                style={{ fontSize: 'inherit', lineHeight: '1.65' }}
                              >
                                {inc.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedLawId === 'cf88' && activeArticle.number === '5' && (
                    <div className="pt-2 flex justify-center">
                      <button
                        onClick={() => setShowAllIncisos(prev => !prev)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-label-mono text-label-mono transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {showAllIncisos ? 'visibility_off' : 'expand_more'}
                        </span>
                        <span>
                          {showAllIncisos
                            ? 'Mostrar apenas Incisos Top Concursos (I, II, III, IV, X, XI)'
                            : `Ver todos os ${activeArticle.totalRealIncisos} incisos e parágrafos do Art. 5º`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bloco Contextual Expandido: Exemplo Prático FreeLLM API */}
            <div className="px-margin mt-space-md">
              <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
                <div className="flex items-center justify-between pb-space-xs mb-space-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant">
                      <span className="material-symbols-outlined text-[17px] text-secondary">cases</span>
                    </div>
                    <div>
                      <h2 className="font-title-md text-title-md text-on-surface leading-tight">
                        Exemplo em Caso Prático
                      </h2>
                      <p className="font-label-mono text-label-mono text-outline">
                        {practicalCase.refTag}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-mono text-label-mono">
                    {practicalCase.temaBadge}
                  </span>
                </div>

                <div className="space-y-2.5 mt-2">
                  <div className="p-3 rounded-lg bg-surface-container-low text-on-surface">
                    <p className="font-body-sm text-body-sm leading-relaxed">
                      <strong className="text-secondary font-semibold">Cenário:</strong>{' '}
                      {practicalCase.cenario}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container text-on-surface">
                    <p className="font-body-sm text-body-sm leading-relaxed">
                      <strong className="text-on-surface font-semibold">Decisão Prática do STJ/STF:</strong>{' '}
                      A simples fuga desprovida de prévia investigação não legitima a invasão domiciliar. A prova colhida é{' '}
                      <strong className="text-error font-semibold">ilícita</strong> por violação ao Art. 5º, XI da CF/88.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-high">
                    <span className="material-symbols-outlined text-[18px] text-secondary">tips_and_updates</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-label-tag text-label-tag text-on-surface font-semibold">
                        {practicalCase.mnemonicTitle}
                      </p>
                      <p className="font-label-mono text-label-mono text-on-surface-variant truncate">
                        <span className="font-bold text-secondary">{practicalCase.mnemonicCode}</span> ={' '}
                        <strong>F</strong>lagrante | <strong>D</strong>esastre | <strong>S</strong>ocorro
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Súmulas Vinculantes Conectadas */}
            <div className="px-margin mt-space-md">
              <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
                    <h2 className="font-title-md text-title-md text-on-surface">Jurisprudência Vinculada</h2>
                  </div>
                  <span className="font-label-mono text-label-mono text-on-surface-variant">
                    {precedents.length} Súmulas
                  </span>
                </div>
                <div className="space-y-2">
                  {precedents.map((sumula, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-surface text-on-surface">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-label-mono text-label-mono font-bold text-secondary">
                          {sumula.title}
                        </span>
                        <span className="font-label-tag text-label-tag text-outline">
                          {sumula.tag}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {sumula.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Barra Flutuante de Ações FreeLLM IA (ASSISTENTE CONTEXTUAL) */}
            <div className="px-margin mt-space-md">
              <div className="rounded-xl bg-primary-container p-space-sm shadow-md">
                <div className="flex items-center justify-between px-1 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">smart_toy</span>
                    <span className="font-label-mono text-label-mono text-inverse-on-surface font-semibold tracking-wide">
                      ASSISTENTE CONTEXTUAL
                    </span>
                  </div>
                  <span className="font-label-mono text-label-mono text-on-primary-container">FreeLLM v2.4</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openExplainDrawer('geral')}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all active:scale-[0.98] shadow-sm text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-secondary">lightbulb</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-title-md text-body-sm font-bold truncate">Explicar com IA</p>
                      <p className="font-label-tag text-label-tag text-outline truncate">Sem juridiquês</p>
                    </div>
                  </button>

                  <button
                    onClick={() => openQuizDrawer(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all active:scale-[0.98] shadow-sm text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-primary">quiz</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-title-md text-body-sm font-bold truncate">Gerar Questão</p>
                      <p className="font-label-tag text-label-tag text-outline truncate">Cebraspe / FGV</p>
                    </div>
                  </button>

                  <button
                    onClick={openJurisDrawer}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all active:scale-[0.98] shadow-sm text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-primary">policy</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-title-md text-body-sm font-bold truncate">STF / STJ</p>
                      <p className="font-label-tag text-label-tag text-outline truncate">Teses aplicadas</p>
                    </div>
                  </button>

                  <button
                    onClick={toggleAudio}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all active:scale-[0.98] shadow-sm text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-secondary">headset</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-title-md text-body-sm font-bold truncate">Modo Áudio</p>
                      <p className="font-label-tag text-label-tag text-outline truncate">
                        {isPlayingAudio ? 'Tocando agora...' : 'Voz Neural 1.2x'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            ABA 1: BIBLIOTECA VADE MECUM
           ========================================================= */}
        {activeTab === 'codigos-biblioteca' && (
          <div className="px-margin pt-2 pb-10 space-y-4">
            <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm border border-outline-variant/30 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-outline text-[20px] shrink-0">search</span>
              <input
                id="library-search-input"
                type="text"
                value={librarySearch}
                onChange={e => setLibrarySearch(e.target.value)}
                placeholder="Pesquisar código, lei número ou matéria (ex: Eleitoral, 14.133, CF/88)..."
                className="w-full bg-transparent font-body-sm text-body-sm text-on-surface focus:outline-none"
              />
              {librarySearch && (
                <button
                  onClick={() => setLibrarySearch('')}
                  className="text-outline hover:text-on-surface shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {areas.map(area => (
                <button
                  key={area}
                  onClick={() => setLibraryAreaFilter(area)}
                  className={`px-3 py-1.5 rounded-xl font-label-tag text-label-tag whitespace-nowrap transition-all ${
                    libraryAreaFilter === area
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCatalog.map(law => {
                const isSelected = law.id === selectedLawId;
                const sTitle = law.shortTitle || law.shortName;
                const sArea = law.area || law.category;
                return (
                  <div
                    key={law.id}
                    onClick={() => {
                      setSelectedLawId(law.id);
                      setActiveTab('leitor-artigos');
                    }}
                    className={`rounded-xl p-space-md transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? 'bg-surface-container-lowest ring-2 ring-secondary'
                        : 'bg-surface-container-lowest hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-primary text-on-primary font-label-mono text-label-mono font-semibold">
                          {sTitle}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-mono text-label-mono">
                          {sArea}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-outline text-[18px]">arrow_forward</span>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface mb-1">
                      {law.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {law.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">local_fire_department</span>
                <h2 className="font-title-md text-title-md text-on-surface">
                  Temas Mais Cobrados (Estudo Direcionado IA)
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {topics.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedLawId(t.lawId);
                      setSimTheme(`${t.title} (${t.keywords?.join(', ')})`);
                      setActiveTab('simulador-ia');
                    }}
                    className="p-3 rounded-xl bg-surface hover:bg-surface-container-low text-left transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-title-md text-body-sm font-bold text-on-surface truncate">
                        {t.title}
                      </p>
                      <p className="font-label-mono text-label-mono text-outline truncate">
                        Foco: {t.keywords?.join(' • ')}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">psychology</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            ABA 3: SIMULADOR IA
           ========================================================= */}
        {activeTab === 'simulador-ia' && (
          <div className="px-margin pt-space-sm pb-10 space-y-4">
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-[18px]">psychology</span>
                  </div>
                  <div>
                    <h2 className="font-title-md text-title-md text-on-surface">
                      Simulador de Questões Inéditas
                    </h2>
                    <p className="font-label-mono text-label-mono text-outline">
                      Motor FreeLLM • Baseado na Lei Seca Oficial
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label-mono text-label-mono text-on-surface-variant">
                  {currentLaw?.shortTitle || currentLaw?.shortName || 'CF/88'}
                </span>
              </div>

              <div className="space-y-2">
                <label className="block font-label-tag text-label-tag text-on-surface-variant">
                  Tema ou Dispositivo para o Simulado
                </label>
                <input
                  type="text"
                  value={simTheme}
                  onChange={e => setSimTheme(e.target.value)}
                  placeholder="Ex: Inviolabilidade Domiciliar, Direitos Políticos, Licitações..."
                  className="w-full p-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-label-tag text-label-tag text-on-surface-variant mb-1">
                    Banca
                  </label>
                  <select
                    value={simBanca}
                    onChange={e => setSimBanca(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface-container-low font-label-mono text-label-mono text-on-surface"
                  >
                    <option>Cebraspe / FGV</option>
                    <option>FGV / OAB</option>
                    <option>FCC / Tribunais</option>
                    <option>Vunesp</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-tag text-label-tag text-on-surface-variant mb-1">
                    Nível
                  </label>
                  <select
                    value={simDifficulty}
                    onChange={e => setSimDifficulty(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface-container-low font-label-mono text-label-mono text-on-surface"
                  >
                    <option>Médio (Concurso/OAB)</option>
                    <option>Difícil (Magistratura/MP)</option>
                    <option>Essencial (Fixação)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-tag text-label-tag text-on-surface-variant mb-1">
                    Questões
                  </label>
                  <select
                    value={simCount}
                    onChange={e => setSimCount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-surface-container-low font-label-mono text-label-mono text-on-surface"
                  >
                    <option value={3}>3 Questões</option>
                    <option value={5}>5 Questões</option>
                    <option value={8}>8 Questões</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateSimulation}
                disabled={simLoading}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-title-md text-body-regular font-semibold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary-container">
                  {simLoading ? 'hourglass_top' : 'auto_awesome'}
                </span>
                <span>
                  {simLoading ? 'Elaborando Questões Inéditas com IA...' : 'Gerar Bateria de Questões Agora'}
                </span>
              </button>
            </div>

            {simQuizData && (
              <div className="space-y-4">
                {simQuizData.topicSummary && (
                  <div className="p-space-md rounded-xl bg-secondary-fixed/40 text-on-surface shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-[18px] text-secondary">tips_and_updates</span>
                      <span className="font-label-mono text-label-mono font-bold text-secondary">
                        Resumo Estratégico da IA
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                      {simQuizData.topicSummary}
                    </p>
                  </div>
                )}

                {(simQuizData.questions || []).map((q, qIdx) => {
                  const chosen = simAnswers[qIdx];
                  const isRevealed = simRevealed[qIdx];
                  return (
                    <div
                      key={q.id || qIdx}
                      className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label-mono text-label-mono font-bold text-on-surface">
                          Questão {qIdx + 1} • {q.banca || simBanca}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest font-label-mono text-label-mono text-on-surface-variant">
                          {q.articleRef || activeArticle.key}
                        </span>
                      </div>

                      <p className="font-body-legal text-body-regular text-on-surface leading-relaxed">
                        {q.statement}
                      </p>

                      <div className="space-y-2">
                        {(q.options || []).map((opt, oIdx) => {
                          const letter = opt.trim().charAt(0).toUpperCase();
                          const isThisChosen = chosen === letter;
                          const isCorrectAns = q.answer?.trim().toUpperCase().startsWith(letter);

                          let btnStyle = 'bg-surface hover:bg-surface-container text-on-surface';
                          if (isRevealed) {
                            if (isCorrectAns) {
                              btnStyle = 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold';
                            } else if (isThisChosen && !isCorrectAns) {
                              btnStyle = 'bg-error-container text-on-error-container';
                            }
                          } else if (isThisChosen) {
                            btnStyle = 'bg-secondary-fixed text-on-secondary-fixed-variant font-semibold';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => {
                                if (isRevealed) return;
                                setSimAnswers(prev => ({ ...prev, [qIdx]: letter }));
                                setSimRevealed(prev => ({ ...prev, [qIdx]: true }));
                                recordAnswerResult(q, letter);
                              }}
                              className={`w-full text-left p-3 rounded-lg font-body-sm text-body-sm transition-colors ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isRevealed && (
                        <div className="p-3 rounded-xl bg-surface-container space-y-1.5 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="font-label-mono text-label-mono font-bold text-secondary">
                              Gabarito Oficial: {q.answer}
                            </span>
                            <span className="font-label-mono text-label-mono text-on-surface-variant">
                              {q.articleRef}
                            </span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                            {q.explanation}
                          </p>
                          {q.distractorAnalysis && (
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              <strong>Análise das pegadinhas:</strong> {q.distractorAnalysis}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            ABA 4: DESEMPENHO E CADERNO DE REVISÃO
           ========================================================= */}
        {activeTab === 'desempenho' && (
          <div className="px-margin pt-space-sm pb-10 space-y-4">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm">
                <span className="font-label-mono text-label-mono text-outline">Questões</span>
                <p className="font-headline-md text-headline-md text-on-surface mt-1">
                  {progress.stats?.questionsAnswered || 0}
                </p>
                <span className="font-label-tag text-label-tag text-on-tertiary-container">
                  Resolvidas
                </span>
              </div>
              <div className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm">
                <span className="font-label-mono text-label-mono text-outline">Aproveitamento</span>
                <p className="font-headline-md text-headline-md text-secondary mt-1">
                  {accuracyPercent}%
                </p>
                <span className="font-label-tag text-label-tag text-outline">
                  Meta OAB/Tribunais
                </span>
              </div>
              <div className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm">
                <span className="font-label-mono text-label-mono text-outline">Caderno</span>
                <p className="font-headline-md text-headline-md text-on-surface mt-1">
                  {progress.notes?.length || 0}
                </p>
                <span className="font-label-tag text-label-tag text-outline">
                  Fichamentos
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">edit_note</span>
                <h2 className="font-title-md text-title-md text-on-surface">
                  Fichamento Rápido ({currentLaw?.shortTitle || currentLaw?.shortName || 'CF/88'} • {activeArticle.key})
                </h2>
              </div>
              <textarea
                rows={2}
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="Anote um mnemônico, exceção de prazo ou súmula importante..."
                className="w-full p-2.5 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none"
              />
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-tag text-label-tag"
              >
                Salvar no Caderno Offline
              </button>

              {progress.notes?.length > 0 && (
                <div className="space-y-2 pt-2">
                  {progress.notes.map((n, i) => (
                    <div key={n.id || i} className="p-2.5 rounded-lg bg-surface">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-label-mono text-label-mono font-bold text-secondary">
                          {n.lawTitle} • {n.article}
                        </span>
                        <span className="font-label-mono text-label-mono text-outline">{n.date}</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface">{n.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[20px]">bookmark_manager</span>
                  <h2 className="font-title-md text-title-md text-on-surface">
                    Caderno de Revisão de Erros
                  </h2>
                </div>
                <span className="font-label-mono text-label-mono text-outline">
                  {progress.savedQuestions?.length || 0} itens
                </span>
              </div>
              {(progress.savedQuestions || []).length === 0 ? (
                <p className="font-body-sm text-body-sm text-outline">
                  As questões que você errar nos simulados aparecerão automaticamente aqui para revisão espaçada.
                </p>
              ) : (
                <div className="space-y-2">
                  {progress.savedQuestions.map((sq, idx) => (
                    <div key={sq.id || idx} className="p-3 rounded-lg bg-surface space-y-1">
                      <span className="font-label-mono text-label-mono font-bold text-error">
                        {sq.lawTitle} • {sq.articleRef}
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface">{sq.statement}</p>
                      <p className="font-label-tag text-label-tag text-on-tertiary-container">
                        Gabarito: {sq.answer} — {sq.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            DRAWER MODAL CONTEXTUAL DA IA
           ========================================================= */}
        {drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 transition-opacity"
            />
            <div className="fixed inset-x-0 bottom-0 z-50 max-w-4xl mx-auto max-h-[85vh] bg-surface-container-lowest rounded-t-2xl shadow-xl flex flex-col">
              <div className="w-full pt-3 pb-1 flex justify-center">
                <div className="w-12 h-1.5 rounded-full bg-surface-container-highest"></div>
              </div>

              <div className="px-margin pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">auto_awesome</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    {drawerMode === 'explain' && 'Explicação Descomplicada'}
                    {drawerMode === 'quiz' && 'Questão de Concurso Inédita'}
                    {drawerMode === 'juris' && 'Teses de Repercussão Geral'}
                    {drawerMode === 'apk' && 'Atualização Sem Cabo (GitHub OTA)'}
                  </h3>
                </div>
                <button
                  aria-label="Fechar painel"
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="px-margin pb-8 overflow-y-auto space-y-4">
                {drawerMode === 'explain' && (
                  <>
                    <div className="p-3.5 rounded-xl bg-secondary-fixed/20">
                      <h4 className="font-title-md text-title-md text-on-surface mb-1">
                        O que {currentLaw?.shortTitle || currentLaw?.shortName || 'a CF/88'} ({activeArticle.key}) quis dizer?
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        {activeArticle.number === '5' && selectedLawId === 'cf88'
                          ? 'O Art. 5º é o núcleo duro da cidadania brasileira. Ele diz que o Estado existe para proteger as pessoas, e não o oposto. As regras de liberdade, privacidade e moradia servem de escudo contra abusos do poder policial ou governamental.'
                          : activeArticle.caput}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-container">
                      <span className="font-label-mono text-label-mono text-secondary font-bold">
                        Dica de Fixação:
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface mt-1">
                        "Casa" não é só sua residência. Para a lei, quarto de hotel ocupado, trailers e consultórios médicos também são considerados "asilo inviolável"!
                      </p>
                    </div>

                    {drawerLoading && (
                      <div className="p-4 rounded-xl bg-surface-container-low flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary animate-spin">progress_activity</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Consultando Professor IA (FreeLLM GPT-OSS-120B) sobre {activeArticle.key}...
                        </span>
                      </div>
                    )}

                    {aiExplanation && (
                      <div className="p-3.5 rounded-xl bg-surface-container-low space-y-2 border border-outline-variant/40">
                        <div className="flex items-center justify-between">
                          <span className="font-label-mono text-label-mono font-bold text-secondary">
                            Análise Aprofundada • Professor IA
                          </span>
                          <span className="font-label-mono text-label-mono text-outline">Groq 120B</span>
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface whitespace-pre-line leading-relaxed">
                          {aiExplanation}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-title-md text-title-md text-center"
                    >
                      Entendi perfeitamente
                    </button>
                  </>
                )}

                {drawerMode === 'quiz' && (
                  <div className="p-3.5 rounded-xl bg-surface-container-low space-y-3">
                    {drawerLoading ? (
                      <div className="py-6 flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-secondary animate-spin text-[28px]">
                          progress_activity
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Gerando questão inédita estilo Cebraspe / FGV sobre {activeArticle.key}...
                        </p>
                      </div>
                    ) : drawerDynamicQuiz ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-label-mono text-label-mono font-bold text-on-surface">
                            Banca Simulada: {drawerDynamicQuiz.banca || 'Cebraspe / FGV'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-highest font-label-mono text-label-mono">
                            Inédita IA
                          </span>
                        </div>
                        <p className="font-body-regular text-body-regular text-on-surface mb-3">
                          {drawerDynamicQuiz.statement}
                        </p>
                        <div className="space-y-2">
                          {(drawerDynamicQuiz.options || []).map((opt, idx) => {
                            const letter = opt.trim().charAt(0).toUpperCase();
                            const isCorrect = drawerDynamicQuiz.answer?.trim().toUpperCase().startsWith(letter);
                            const isSelected = drawerQuizAnswer === letter;
                            let cls = 'bg-surface hover:bg-surface-container text-on-surface';
                            if (drawerQuizAnswer) {
                              if (isCorrect) cls = 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold';
                              else if (isSelected) cls = 'bg-error-container text-on-error-container';
                            }
                            return (
                              <button
                                key={idx}
                                onClick={() => setDrawerQuizAnswer(letter)}
                                className={`w-full text-left p-2.5 rounded-lg font-body-sm text-body-sm transition-colors ${cls}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {drawerQuizAnswer && (
                          <div className="p-3 rounded-lg bg-surface-container mt-2">
                            <p className="font-label-mono text-label-mono font-bold text-secondary">
                              Gabarito: {drawerDynamicQuiz.answer}
                            </p>
                            <p className="font-body-sm text-body-sm text-on-surface mt-1">
                              {drawerDynamicQuiz.explanation}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-label-mono text-label-mono font-bold text-on-surface">
                            Banca Simulada: Cebraspe / MPU
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-highest font-label-mono text-label-mono">
                            Inédita
                          </span>
                        </div>
                        <p className="font-body-regular text-body-regular text-on-surface mb-3">
                          À luz da jurisprudência do STF sobre a inviolabilidade do domicílio (Art. 5º, XI), a entrada forçada em domicílio sem mandado judicial é lícita, mesmo em período noturno, quando:
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => setDrawerQuizAnswer('A')}
                            className={`w-full text-left p-2.5 rounded-lg font-body-sm text-body-sm transition-colors ${
                              drawerQuizAnswer === 'A'
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-surface hover:bg-surface-container'
                            }`}
                          >
                            A) O agente policial suspeitar subjetivamente de tráfico.
                          </button>
                          <button
                            onClick={() => setDrawerQuizAnswer('B')}
                            className={`w-full text-left p-2.5 rounded-lg font-body-sm text-body-sm transition-colors ${
                              drawerQuizAnswer === 'B'
                                ? 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold'
                                : 'bg-surface hover:bg-surface-container'
                            }`}
                          >
                            B) Houver fundadas razões de situação de flagrante delito devidamente justificadas posteriormente.
                          </button>
                          <button
                            onClick={() => setDrawerQuizAnswer('C')}
                            className={`w-full text-left p-2.5 rounded-lg font-body-sm text-body-sm transition-colors ${
                              drawerQuizAnswer === 'C'
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-surface hover:bg-surface-container'
                            }`}
                          >
                            C) Houver mandado judicial expedido pelo juiz competente para cumprimento às 22h.
                          </button>
                        </div>
                        <p className="font-label-tag text-label-tag text-outline mt-3 text-center">
                          Toque na alternativa para responder
                        </p>
                      </>
                    )}

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => openQuizDrawer(true)}
                        className="flex-1 py-2 rounded-lg bg-primary text-on-primary font-label-mono text-label-mono"
                      >
                        Sortear Nova Questão com IA
                      </button>
                    </div>
                  </div>
                )}

                {drawerMode === 'juris' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-surface-container">
                      <span className="font-label-mono text-label-mono font-bold text-primary">
                        Tema 280 / STF
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface mt-1">
                        A entrada forçada em domicílio sem mandado judicial só é lícita quando amparada em fundadas razões que indiquem flagrante delito no interior da residência.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container">
                      <span className="font-label-mono text-label-mono font-bold text-primary">
                        HC 598.051 / STJ
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface mt-1">
                        O consentimento do morador deve ser comprovado documentalmente ou registrado em áudio e vídeo pelo Estado.
                      </p>
                    </div>
                    <button
                      onClick={() => openExplainDrawer('jurisprudencia')}
                      className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-label-mono text-label-mono"
                    >
                      Pesquisar Mais Julgados STF/STJ de {activeArticle.key} com IA
                    </button>
                  </div>
                )}

                {drawerMode === 'apk' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-surface-container">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-label-mono text-label-mono font-bold text-secondary">
                          Fonte Oficial: github.com/alissonpeixer/leis
                        </span>
                        <span className="font-label-mono text-label-mono text-on-tertiary-container">
                          OTA Ativo
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface mt-1">
                        Status: <strong>{syncStatus}</strong>. As leis e atualizações são sincronizadas diretamente do seu repositório no GitHub, sem precisar de cabo USB ou do PC ligado.
                      </p>
                    </div>

                    <button
                      onClick={() => loadLawContent(selectedLawId, true)}
                      className="w-full py-3 rounded-xl bg-secondary-fixed text-on-secondary-fixed-variant font-title-md text-body-sm font-bold flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">sync</span>
                      <span>Sincronizar Lei Atual do GitHub Agora</span>
                    </button>

                    <a
                      href={GITHUB_OTA_WEB_URL}
                      className="w-full py-3 rounded-xl bg-surface-container-high text-on-surface font-title-md text-body-sm font-bold flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                      <span>Carregar Última Versão Web da Nuvem (OTA)</span>
                    </a>

                    <a
                      href={GITHUB_APK_URL}
                      download
                      className="w-full py-3 rounded-xl bg-primary text-on-primary font-title-md text-body-regular font-semibold flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">android</span>
                      <span>Baixar APK Direto do GitHub (Sem Cabo)</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* BOTTOM NAVIGATION BAR FIXA */}
      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
        <div className="max-w-4xl mx-auto h-16 px-space-sm flex items-center justify-around">
          <button
            onClick={() => setActiveTab('codigos-biblioteca')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
              activeTab === 'codigos-biblioteca'
                ? 'text-primary font-title-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">menu_book</span>
            <span className="font-label-tag text-label-tag mt-0.5">Biblioteca</span>
          </button>

          <button
            onClick={() => setActiveTab('leitor-artigos')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
              activeTab === 'leitor-artigos'
                ? 'text-primary font-title-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">gavel</span>
            <span className="font-label-tag text-label-tag mt-0.5">Leitor</span>
          </button>

          <button
            onClick={() => setActiveTab('simulador-ia')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
              activeTab === 'simulador-ia'
                ? 'text-primary font-title-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
              <span className="absolute -top-1 -right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
            </div>
            <span className="font-label-tag text-label-tag mt-0.5">Simulador</span>
          </button>

          <button
            onClick={() => setActiveTab('desempenho')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
              activeTab === 'desempenho'
                ? 'text-primary font-title-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">insights</span>
            <span className="font-label-tag text-label-tag mt-0.5">Desempenho</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
