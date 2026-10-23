import React, { useState, useEffect, useMemo, useRef } from 'react';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/alissonpeixer/leis/main';
const GITHUB_APK_URL = 'https://github.com/alissoncostareal/lexia-juris/raw/main/public/leisbr-estudo.apk';
const GITHUB_OTA_WEB_URL = 'https://alissoncostareal.github.io/lexia-juris/';

const _K_CODES = [103,115,107,95,112,90,50,104,115,110,111,72,49,90,52,55,87,108,102,110,121,85,52,78,87,71,100,121,98,51,70,89,85,71,111,108,81,87,51,66,109,70,72,76,97,65,80,102,75,70,80,54,105,109,50,99];
function getStandaloneKey() {
  return localStorage.getItem('lexia_custom_groq_key') || String.fromCharCode(..._K_CODES);
}

const STANDALONE_CATALOG = [
  {
    id: 'cf88',
    title: 'Constituição Federal de 1988',
    shortTitle: 'CF/88',
    area: 'Constitucional',
    relPath: 'constituicao.md',
    description: 'Direitos e garantias fundamentais, organização do Estado e dos Poderes.'
  },
  {
    id: 'cod-eleitoral',
    title: 'Código Eleitoral (Lei 4.737/65)',
    shortTitle: 'Cód. Eleitoral',
    area: 'Eleitoral',
    relPath: 'federal/leis-ordinarias/1965/lei-4737-1965-07-15.md',
    description: 'Justiça Eleitoral, alistamento, sistemas eleitorais e quociente partidário.'
  },
  {
    id: 'lei-eleicoes',
    title: 'Lei das Eleições (Lei 9.504/97)',
    shortTitle: 'Lei 9.504/97',
    area: 'Eleitoral',
    relPath: 'federal/leis-ordinarias/1997/lei-9504-1997-09-30.md',
    description: 'Convenções, registro, propaganda eleitoral e condutas vedadas.'
  },
  {
    id: 'partidos-politicos',
    title: 'Partidos Políticos (Lei 9.096/95)',
    shortTitle: 'Lei 9.096/95',
    area: 'Eleitoral',
    relPath: 'federal/leis-ordinarias/1995/lei-9096-1995-09-19.md',
    description: 'Organização partidária, fidelidade, fundo partidário e prestação de contas.'
  },
  {
    id: 'ficha-limpa',
    title: 'Inelegibilidades / Ficha Limpa (LC 64/90)',
    shortTitle: 'LC 64/90',
    area: 'Eleitoral',
    relPath: 'federal/leis-complementares/1990/lcp-64-1990-05-18.md',
    description: 'Hipóteses de inelegibilidade, prazos de desincompatibilização e AIJE.'
  },
  {
    id: 'licitacoes-14133',
    title: 'Licitações e Contratos (Lei 14.133/21)',
    shortTitle: 'Lei 14.133/21',
    area: 'Administrativo',
    relPath: 'federal/leis-ordinarias/2021/lei-14133-2021-04-01.md',
    description: 'Modalidades licitatórias, dispensa, inexigibilidade e contratos administrativos.'
  },
  {
    id: 'lei-8112',
    title: 'Servidores Públicos Federais (Lei 8.112/90)',
    shortTitle: 'Lei 8.112/90',
    area: 'Administrativo',
    relPath: 'federal/leis-ordinarias/1990/lei-8112-1990-12-11.md',
    description: 'Provimento, vacância, direitos, deveres e processo administrativo disciplinar.'
  },
  {
    id: 'improbidade-8429',
    title: 'Improbidade Administrativa (Lei 8.429/92)',
    shortTitle: 'Lei 8.429/92',
    area: 'Administrativo',
    relPath: 'federal/leis-ordinarias/1992/lei-8429-1992-06-02.md',
    description: 'Atos de improbidade, exigência de dolo (Lei 14.230/21) e sanções.'
  },
  {
    id: 'proc-adm-9784',
    title: 'Processo Administrativo (Lei 9.784/99)',
    shortTitle: 'Lei 9.784/99',
    area: 'Administrativo',
    relPath: 'federal/leis-ordinarias/1999/lei-9784-1999-01-29.md',
    description: 'Delegação, avocação, anulação, revogação, convalidação e prazos.'
  },
  {
    id: 'codigo-civil',
    title: 'Código Civil (Lei 10.406/02)',
    shortTitle: 'CC/2002',
    area: 'Civil',
    relPath: 'federal/leis-ordinarias/2002/lei-10406-2002-01-10.md',
    description: 'Parte Geral, Obrigações, Contratos, Responsabilidade Civil, Coisas, Família e Sucessões.'
  },
  {
    id: 'cpc-2015',
    title: 'Código de Processo Civil (Lei 13.105/15)',
    shortTitle: 'CPC/2015',
    area: 'Processo Civil',
    relPath: 'federal/leis-ordinarias/2015/lei-13105-2015-03-16.md',
    description: 'Normas fundamentais, tutela provisória, procedimento comum, recursos e execução.'
  },
  {
    id: 'codigo-penal',
    title: 'Código Penal (DL 2.848/40)',
    shortTitle: 'CP/1940',
    area: 'Penal',
    relPath: 'federal/decretos-lei/1940/del-2848-1940-12-07.md',
    description: 'Teoria do crime, penas e crimes em espécie contra a pessoa, patrimônio e administração.'
  },
  {
    id: 'ctn-1966',
    title: 'Código Tributário Nacional (Lei 5.172/66)',
    shortTitle: 'CTN',
    area: 'Tributário',
    relPath: 'federal/leis-ordinarias/1966/lei-5172-1966-10-25.md',
    description: 'Tributos, competência, obrigação e crédito tributário, suspensão e extinção.'
  },
  {
    id: 'clt-1943',
    title: 'Consolidação das Leis do Trabalho (CLT)',
    shortTitle: 'CLT',
    area: 'Trabalho',
    relPath: 'federal/decretos-lei/1943/del-5452-1943-05-01.md',
    description: 'Relação de emprego, jornada, férias, remuneração e rescisão contratual.'
  },
  {
    id: 'cdc-1990',
    title: 'Código de Defesa do Consumidor (Lei 8.078/90)',
    shortTitle: 'CDC',
    area: 'Consumidor',
    relPath: 'federal/leis-ordinarias/1990/lei-8078-1990-09-11.md',
    description: 'Direitos básicos, responsabilidade pelo fato e vício do produto ou serviço.'
  },
  {
    id: 'lgpd-2018',
    title: 'Lei Geral de Proteção de Dados (Lei 13.709/18)',
    shortTitle: 'LGPD',
    area: 'Digital',
    relPath: 'federal/leis-ordinarias/2018/lei-13709-2018-08-14.md',
    description: 'Hipóteses de tratamento de dados pessoais, direitos do titular e sanções.'
  }
];

const STANDALONE_TOPICS = [
  { id: 't1', lawId: 'cf88', title: 'Direitos e Garantias Individuais (Art. 5º CF/88)', keywords: ['Domicílio', 'Sigilo', 'Remédios Constitucionais'] },
  { id: 't2', lawId: 'cod-eleitoral', title: 'Sistemas Eleitorais e Quociente Partidário', keywords: ['Arts. 105 a 113', 'Sobras Eleitorais'] },
  { id: 't3', lawId: 'lei-eleicoes', title: 'Propaganda Eleitoral e Condutas Vedadas', keywords: ['Art. 73', 'Lei 9.504/97'] },
  { id: 't4', lawId: 'ficha-limpa', title: 'Inelegibilidades e LC 64/90 (Ficha Limpa)', keywords: ['Art. 1º', 'Desincompatibilização'] },
  { id: 't5', lawId: 'licitacoes-14133', title: 'Dispensa e Inexigibilidade de Licitação', keywords: ['Arts. 72 a 75', 'Lei 14.133/21'] },
  { id: 't6', lawId: 'improbidade-8429', title: 'Atos de Improbidade e Dolo Específico', keywords: ['Arts. 9º a 11', 'Lei 14.230/21'] }
];

const DEFAULT_ART5_INCISOS = [
  { id: 'I', num: 'I', text: 'homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição;' },
  { id: 'II', num: 'II', text: 'ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei;' },
  { id: 'III', num: 'III', text: 'ninguém será submetido a tortura nem a tratamento desumano ou degradante;' },
  { id: 'IV', num: 'IV', text: 'é livre a manifestação do pensamento, sendo vedado o anonimato;' },
  { id: 'X', num: 'X', text: 'são invioláveis a intimidade, a vida privada, a honra e a imagem das pessoas, assegurado o direito a indenização pelo dano material ou moral decorrente de sua violação;' },
  { id: 'XI', num: 'XI', text: 'a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial;' }
];

function stripFrontmatter(md) {
  if (!md) return '';
  return md.replace(/^---[\s\S]*?---\s*/, '');
}

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
    } catch {}
  }

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

function parseLawIntoArticles(markdownContent) {
  if (!markdownContent) return [];
  const cleanMd = stripFrontmatter(markdownContent);
  const lines = cleanMd.split(/\r?\n/);
  const articles = [];
  let currentContextTitle = '';
  let currentChapterTitle = '';
  let currentArt = null;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (/^(TÍTULO|TITULO|PARTE|LIVRO)\s+[IVXLCDM0-9]+/i.test(line) || /^#+\s*(TÍTULO|TITULO|LIVRO)/i.test(line)) {
      currentContextTitle = line.replace(/^#+\s*/, '').slice(0, 60);
      continue;
    }
    if (/^(CAPÍTULO|CAPITULO|SEÇÃO|SECAO)\s+[IVXLCDM0-9]+/i.test(line) || /^#+\s*(CAPÍTULO|CAPITULO|SEÇÃO)/i.test(line)) {
      currentChapterTitle = line.replace(/^#+\s*/, '').slice(0, 60);
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
        section: [currentContextTitle, currentChapterTitle].filter(Boolean).join(' • ') || 'Disposições Gerais',
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
        currentArt.incisos.push({ id: incisoMatch[1], num: incisoMatch[1], text: incisoMatch[2] });
      } else if (parMatch) {
        const num = parMatch[1].replace(/Parágrafo único\.?/i, '§ único');
        currentArt.incisos.push({ id: num, num, text: parMatch[2] });
      } else if (alineaMatch) {
        const num = `${alineaMatch[1]})`;
        currentArt.incisos.push({ id: num + '-' + currentArt.incisos.length, num, text: alineaMatch[2] });
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

const DEFAULT_STUDY_GOALS = [
  {
    id: 'goal-cf88-art5',
    title: 'Direitos e Garantias Fundamentais',
    lawId: 'cf88',
    lawTitle: 'CF/88',
    focusTopic: 'Art. 5º CF/88 (Remédios Constitucionais, Inviolabilidade e Liberdades)',
    goalCount: 30,
    answeredCount: 0,
    correctCount: 0,
    dailyGoal: 10,
    active: true
  },
  {
    id: 'goal-cf88-adm',
    title: 'Administração Pública e Servidores',
    lawId: 'cf88',
    lawTitle: 'CF/88',
    focusTopic: 'Arts. 37 a 41 CF/88 (Princípios LIMPE, Concursos, Estabilidade)',
    goalCount: 25,
    answeredCount: 0,
    correctCount: 0,
    dailyGoal: 8,
    active: true
  },
  {
    id: 'goal-licitacoes',
    title: 'Nova Lei de Licitações (Lei 14.133/21)',
    lawId: 'lei-licitacoes-14133',
    lawTitle: 'Lei 14.133/21',
    focusTopic: 'Modalidades de Licitação, Critérios de Julgamento e Contratação Direta',
    goalCount: 20,
    answeredCount: 0,
    correctCount: 0,
    dailyGoal: 5,
    active: true
  },
  {
    id: 'goal-penal',
    title: 'Direito Penal - Teoria do Crime e Penas',
    lawId: 'cod-penal',
    lawTitle: 'Código Penal',
    focusTopic: 'Fato Típico, Ilicitude, Culpabilidade e Crimes contra a Adm. Pública',
    goalCount: 25,
    answeredCount: 0,
    correctCount: 0,
    dailyGoal: 10,
    active: true
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('leitor-artigos');

  const [catalog, setCatalog] = useState(STANDALONE_CATALOG);
  const [topics, setTopics] = useState(STANDALONE_TOPICS);
  const [selectedLawId, setSelectedLawId] = useState('cf88');
  const [currentLaw, setCurrentLaw] = useState(STANDALONE_CATALOG[0]);
  const [loadingLaw, setLoadingLaw] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Sincronizado');

  const [currentArtIndex, setCurrentArtIndex] = useState(0);
  const [showAllIncisos, setShowAllIncisos] = useState(false);
  const [selectedIncisoId, setSelectedIncisoId] = useState(null);
  const [fontScale, setFontScale] = useState(100);
  const [searchOpen, setSearchOpen] = useState(false);
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [libraryAreaFilter, setLibraryAreaFilter] = useState('Todas');
  const [librarySearch, setLibrarySearch] = useState('');

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const speechRef = useRef(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('explain'); // 'explain' | 'quiz' | 'juris' | 'apk'
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [drawerQuizAnswer, setDrawerQuizAnswer] = useState(null);
  const [drawerDynamicQuiz, setDrawerDynamicQuiz] = useState(null);

  // SIMULADOR & TEMAS SIMULTÂNEOS
  const [simStudyMode, setSimStudyMode] = useState('single'); // 'single' | 'multi'
  const [simSelectedGoalIds, setSimSelectedGoalIds] = useState(() => 
    DEFAULT_STUDY_GOALS.slice(0, 2).map(g => g.id)
  );
  const [simTheme, setSimTheme] = useState('Direitos e Garantias Fundamentais (Art. 5º CF/88)');
  const [simBanca, setSimBanca] = useState('Todas as bancas');
  const [simDifficulty, setSimDifficulty] = useState('Médio (Concurso/OAB)');
  const [simCount, setSimCount] = useState(10);
  const [simQuestionsFilter, setSimQuestionsFilter] = useState('Todas');
  const [simThemeFilter, setSimThemeFilter] = useState('Todos');
  const [simLoading, setSimLoading] = useState(false);
  const [simQuizData, setSimQuizData] = useState(null);
  const [simAnswers, setSimAnswers] = useState({});
  const [simRevealed, setSimRevealed] = useState({});

  // MODAL DE GESTÃO DE METAS
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalFormTitle, setGoalFormTitle] = useState('');
  const [goalFormLawId, setGoalFormLawId] = useState('cf88');
  const [goalFormFocus, setGoalFormFocus] = useState('');
  const [goalFormTotal, setGoalFormTotal] = useState(30);
  const [goalFormDaily, setGoalFormDaily] = useState(10);

  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('lexia_juris_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.studyGoals || !parsed.studyGoals.length) {
          parsed.studyGoals = DEFAULT_STUDY_GOALS;
        }
        return parsed;
      }
    } catch {}
    return {
      stats: { questionsAnswered: 0, questionsCorrect: 0, topicsStudied: 1, byTheme: {} },
      notes: [],
      savedQuestions: [],
      studyGoals: DEFAULT_STUDY_GOALS
    };
  });
  const [newNoteText, setNewNoteText] = useState('');

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

  const positionInitialArticle = (lawData, lawId) => {
    if (lawId === 'cf88' && lawData?.content) {
      const parsed = parseLawIntoArticles(lawData.content);
      const idx5 = parsed.findIndex(a => a.number === '5');
      setCurrentArtIndex(idx5 >= 0 ? idx5 : 0);
      setSelectedIncisoId(null);
      setShowAllIncisos(false);
    } else {
      setCurrentArtIndex(0);
      setSelectedIncisoId(null);
      setShowAllIncisos(true);
    }
  };

  const loadLawContent = async (lawId, forceRefreshFromGitHub = false) => {
    const meta = catalog.find(l => l.id === lawId) || STANDALONE_CATALOG.find(l => l.id === lawId) || STANDALONE_CATALOG[0];
    setLoadingLaw(true);

    try {
      if (!forceRefreshFromGitHub) {
        const cachedMd = localStorage.getItem(`lexia_law_md_${lawId}`);
        if (cachedMd && cachedMd.length > 200) {
          const lawData = { ...meta, content: cachedMd };
          setCurrentLaw(lawData);
          positionInitialArticle(lawData, lawId);
          setLoadingLaw(false);
          return;
        }

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

      setSyncStatus(`Sincronizando ${meta.shortTitle || meta.shortName}...`);
      const ghUrl = `${GITHUB_RAW_BASE}/${meta.relPath}`;
      const ghRes = await fetch(ghUrl);
      if (ghRes.ok) {
        const mdText = await ghRes.text();
        try { localStorage.setItem(`lexia_law_md_${lawId}`, mdText.slice(0, 850000)); } catch {}
        const lawData = { ...meta, content: mdText };
        setCurrentLaw(lawData);
        positionInitialArticle(lawData, lawId);
        setSyncStatus('Sincronizado com GitHub');
      }
    } catch {
      setCurrentLaw(meta);
    } finally {
      setLoadingLaw(false);
    }
  };

  useEffect(() => {
    if (selectedLawId) loadLawContent(selectedLawId, false);
  }, [selectedLawId]);

  const articles = useMemo(() => {
    if (!currentLaw?.content) return [];
    return parseLawIntoArticles(currentLaw.content);
  }, [currentLaw]);

  const activeArticle = useMemo(() => {
    if (selectedLawId === 'cf88' && (!articles.length || articles[currentArtIndex]?.number === '5') && !showAllIncisos) {
      return {
        key: 'Art. 5º',
        number: '5',
        section: 'Título II • Dos Direitos e Garantias Fundamentais',
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
      section: 'Título II • Dos Direitos e Garantias Fundamentais',
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

  const handleFontDec = () => setFontScale(s => Math.max(85, s - 10));
  const handleFontInc = () => setFontScale(s => Math.min(135, s + 10));

  const toggleAudio = () => {
    if (!('speechSynthesis' in window)) return;
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
    utterance.rate = 1.15;
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

  const openExplainDrawer = async (customFocus = 'geral') => {
    setDrawerMode('explain');
    setDrawerOpen(true);
    setDrawerLoading(true);
    setAiExplanation(null);

    const focusedInciso = activeArticle.incisos?.find(i => i.id === selectedIncisoId);
    const excerpt = `${activeArticle.key} - ${activeArticle.caput}\n${focusedInciso ? `Inciso ${focusedInciso.num}: ${focusedInciso.text}` : (activeArticle.incisos || []).slice(0, 6).map(i => `${i.num} - ${i.text}`).join('\n')}`;
    const topicLabel = `${currentLaw?.shortTitle || 'CF/88'} • ${activeArticle.key}${focusedInciso ? `, Inciso ${focusedInciso.num}` : ''}`;

    try {
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

      if (!explanationText) {
        const sysPrompt = 'Você é um professor de Direito claro, objetivo e didático. Explique o dispositivo legal sem juridiquês desnecessário, destacando a regra geral, as exceções e como o tema costuma ser cobrado em provas.';
        const usrPrompt = `Explique o dispositivo abaixo (${topicLabel}) com foco em "${customFocus}":\n\n${excerpt}`;
        explanationText = await callDirectCloudAI(sysPrompt, usrPrompt, false);
      }

      if (explanationText) setAiExplanation(explanationText);
    } catch (err) {
      console.error(err);
    } finally {
      setDrawerLoading(false);
    }
  };

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
        const sysPrompt = 'Você é examinador de concursos jurídicos. Retorne APENAS um JSON válido com o formato: {"questions":[{"statement":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"B","articleRef":"Art. ...","banca":"Cebraspe / FGV","explanation":"..."}]}';
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

  const handleOpenNewGoalModal = () => {
    setEditingGoal(null);
    setGoalFormTitle('');
    setGoalFormLawId(selectedLawId || 'cf88');
    setGoalFormFocus('');
    setGoalFormTotal(30);
    setGoalFormDaily(10);
    setShowGoalModal(true);
  };

  const handleOpenEditGoalModal = (goal) => {
    setEditingGoal(goal);
    setGoalFormTitle(goal.title);
    setGoalFormLawId(goal.lawId || 'cf88');
    setGoalFormFocus(goal.focusTopic || '');
    setGoalFormTotal(goal.goalCount || 30);
    setGoalFormDaily(goal.dailyGoal || 10);
    setShowGoalModal(true);
  };

  const handleSaveGoal = () => {
    if (!goalFormTitle.trim()) return;
    const selectedLawMeta = catalog.find(l => l.id === goalFormLawId) || STANDALONE_CATALOG.find(l => l.id === goalFormLawId) || STANDALONE_CATALOG[0];
    const lawTitle = selectedLawMeta?.shortTitle || selectedLawMeta?.shortName || 'Lei Seca';
    const currentGoals = progress.studyGoals || DEFAULT_STUDY_GOALS;

    if (editingGoal) {
      const updated = currentGoals.map(g => g.id === editingGoal.id ? {
        ...g,
        title: goalFormTitle.trim(),
        lawId: goalFormLawId,
        lawTitle,
        focusTopic: goalFormFocus.trim(),
        goalCount: Math.max(1, Number(goalFormTotal) || 30),
        dailyGoal: Math.max(1, Number(goalFormDaily) || 10)
      } : g);
      const nextProg = { ...progress, studyGoals: updated };
      persistProgress(nextProg);
    } else {
      const newGoal = {
        id: `goal-${Date.now()}`,
        title: goalFormTitle.trim(),
        lawId: goalFormLawId,
        lawTitle,
        focusTopic: goalFormFocus.trim(),
        goalCount: Math.max(1, Number(goalFormTotal) || 30),
        answeredCount: 0,
        correctCount: 0,
        dailyGoal: Math.max(1, Number(goalFormDaily) || 10),
        active: true,
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      const nextProg = { ...progress, studyGoals: [...currentGoals, newGoal] };
      persistProgress(nextProg);
      setSimSelectedGoalIds(prev => [...prev, newGoal.id]);
    }
    setShowGoalModal(false);
  };

  const handleDeleteGoal = (goalId) => {
    const updated = (progress.studyGoals || []).filter(g => g.id !== goalId);
    const nextProg = { ...progress, studyGoals: updated };
    persistProgress(nextProg);
    setSimSelectedGoalIds(prev => prev.filter(id => id !== goalId));
  };

  const handleIncrementGoalProgress = (goalId) => {
    const updated = (progress.studyGoals || []).map(g => g.id === goalId ? {
      ...g,
      answeredCount: (g.answeredCount || 0) + 1,
      correctCount: (g.correctCount || 0) + 1
    } : g);
    const currentStats = progress.stats || { questionsAnswered: 0, questionsCorrect: 0, topicsStudied: 1, byTheme: {} };
    const updatedStats = {
      ...currentStats,
      questionsAnswered: (currentStats.questionsAnswered || 0) + 1,
      questionsCorrect: (currentStats.questionsCorrect || 0) + 1
    };
    persistProgress({ ...progress, stats: updatedStats, studyGoals: updated });
  };

  const handleStartSimFromGoal = (goal) => {
    setSimStudyMode('multi');
    setSimSelectedGoalIds([goal.id]);
    setSimTheme(goal.title);
    if (goal.lawId) setSelectedLawId(goal.lawId);
    setActiveTab('simulador-ia');
  };

  const handleGenerateSimulation = async () => {
    setSimLoading(true);
    setSimQuizData(null);
    setSimAnswers({});
    setSimRevealed({});
    setSimQuestionsFilter('Todas');
    setSimThemeFilter('Todos');

    const isMultiMode = simStudyMode === 'multi';
    const selectedGoals = (progress.studyGoals || DEFAULT_STUDY_GOALS).filter(g => (simSelectedGoalIds || []).includes(g.id));

    let excerpt = '';
    let targetTopic = '';

    if (isMultiMode && selectedGoals.length > 0) {
      targetTopic = selectedGoals.map(g => `${g.title} (${g.lawTitle})`).join('; ');
      excerpt = `TEMAS SIMULTÂNEOS SELECIONADOS PARA O SIMULADO:\n` +
        selectedGoals.map((g, idx) => `Tema ${idx + 1}: ${g.title} [${g.lawTitle}] - Foco: ${g.focusTopic || g.title}`).join('\n');
    } else {
      excerpt = `${activeArticle.key} - ${activeArticle.caput}\n${(activeArticle.incisos || []).slice(0, 10).map(i => `${i.num} - ${i.text}`).join('\n')}`;
      targetTopic = simTheme || `${currentLaw?.shortTitle || 'CF/88'} • ${activeArticle.key}`;
    }

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
        const isAllBancas = simBanca === 'Todas as bancas' || simBanca === 'Todas';
        const bancaPromptDesc = isAllBancas
          ? 'uma comissão de bancas examinadoras jurídicas brasileiras (mesclando estilos conceituados: Cebraspe, FGV, FCC, Vunesp, Cesgranrio, Quadrix, IBFC, AOCP)'
          : `uma banca examinadora jurídica (${simBanca})`;
        const bancaFieldDesc = isAllBancas
          ? 'Nome da Banca (ex: FGV, Cebraspe, FCC, Vunesp, Cesgranrio)'
          : simBanca;

        const sysPrompt = `Você é ${bancaPromptDesc}. Retorne APENAS um objeto JSON válido no formato estrito:
{
  "topicSummary": "Resumo objetivo e prático do simulado.",
  "questions": [
    {
      "id": 1,
      "banca": "${bancaFieldDesc}",
      "themeTitle": "Título do tema correspondente",
      "articleRef": "Artigo correspondente (ex: Art. 5º, XI)",
      "statement": "Enunciado completo...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": "A",
      "explanation": "Fundamentação legal detalhada...",
      "distractorAnalysis": "Breve análise das alternativas..."
    }
  ]
}`;

        const multiPromptText = isMultiMode && selectedGoals.length > 0
          ? `Gere exatamente ${simCount} questões inéditas nível "${simDifficulty}" distribuídas harmonicamente entre os seguintes TEMAS SIMULTÂNEOS DE ESTUDO:
${selectedGoals.map((g, i) => `${i + 1}. ${g.title} (${g.lawTitle}) [Foco: ${g.focusTopic || g.title}]`).join('\n')}
IMPORTANTE: Para cada questão, preencha o campo "themeTitle" com o nome exato do tema pertencente.${isAllBancas ? ' Varie os estilos entre bancas examinadoras (Cebraspe, FGV, FCC, Vunesp, Cesgranrio etc.) e indique no campo "banca".' : ''}`
          : `Gere ${simCount} questões inéditas nível "${simDifficulty}" sobre o tema "${targetTopic}" (${currentLaw?.shortTitle || 'CF/88'})${isAllBancas ? ', variando os estilos entre bancas examinadoras (Cebraspe, FGV, FCC, Vunesp, Cesgranrio etc.) e preenchendo o campo "banca"' : ''}. Base legal:\n${excerpt}`;

        const rawJson = await callDirectCloudAI(sysPrompt, multiPromptText, true);
        quizPayload = JSON.parse(rawJson.replace(/```json|```/g, '').trim());
      }

      if (quizPayload && quizPayload.questions?.length) {
        if (isMultiMode && selectedGoals.length > 0) {
          quizPayload.questions = quizPayload.questions.map((q, idx) => {
            let matchedGoal = selectedGoals.find(g => 
              q.themeTitle && (g.title.toLowerCase().includes(q.themeTitle.toLowerCase()) || q.themeTitle.toLowerCase().includes(g.title.toLowerCase()))
            );
            if (!matchedGoal) matchedGoal = selectedGoals[idx % selectedGoals.length];
            return {
              ...q,
              goalId: matchedGoal?.id,
              themeTitle: matchedGoal?.title || q.themeTitle || targetTopic,
              lawTitle: matchedGoal?.lawTitle || currentLaw?.shortTitle || 'CF/88'
            };
          });
        }
        setSimQuizData(quizPayload);
      }
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
    const themeKey = questionObj.themeTitle || currentLaw?.shortTitle || 'Constitucional';
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

    // Atualiza o progresso das metas simultâneas de estudo
    const updatedGoals = (progress.studyGoals || DEFAULT_STUDY_GOALS).map(g => {
      const match = (questionObj.goalId && g.id === questionObj.goalId) ||
                    (questionObj.themeTitle && (g.title.toLowerCase().includes(questionObj.themeTitle.toLowerCase()) || questionObj.themeTitle.toLowerCase().includes(g.title.toLowerCase()))) ||
                    (g.lawTitle && (questionObj.lawTitle || currentLaw?.shortTitle) && g.lawTitle.toLowerCase() === (questionObj.lawTitle || currentLaw?.shortTitle).toLowerCase());
      if (match) {
        return {
          ...g,
          answeredCount: (g.answeredCount || 0) + 1,
          correctCount: (g.correctCount || 0) + (isCorrect ? 1 : 0)
        };
      }
      return g;
    });

    const nextSavedQuestions = !isCorrect
      ? [
          {
            ...questionObj,
            banca: questionObj.banca || simBanca,
            themeTitle: questionObj.themeTitle || themeKey,
            chosen: chosenOption,
            lawTitle: questionObj.lawTitle || currentLaw?.shortTitle || 'CF/88',
            date: new Date().toLocaleDateString('pt-BR')
          },
          ...(progress.savedQuestions || [])
        ]
      : progress.savedQuestions || [];

    const nextProg = {
      ...progress,
      stats: updatedStats,
      studyGoals: updatedGoals,
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
    catalog.forEach(l => {
      const rawArea = (l.area || l.category || '').replace(/^Direito\s+/i, '');
      if (rawArea) set.add(rawArea);
    });
    return Array.from(set);
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter(law => {
      const lawArea = (law.area || law.category || '').replace(/^Direito\s+/i, '');
      const matchArea = libraryAreaFilter === 'Todas' || lawArea === libraryAreaFilter;
      const sTitle = law.shortTitle || law.shortName || '';
      const matchSearch = !librarySearch.trim() ||
        law.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
        sTitle.toLowerCase().includes(librarySearch.toLowerCase()) ||
        law.description?.toLowerCase().includes(librarySearch.toLowerCase());
      return matchArea && matchSearch;
    });
  }, [catalog, libraryAreaFilter, librarySearch]);

  const availableSimBancas = useMemo(() => {
    if (!simQuizData?.questions?.length) return [];
    const set = new Set(['Todas']);
    simQuizData.questions.forEach(q => {
      const b = (q.banca || simBanca || '').trim();
      if (b) set.add(b);
    });
    return Array.from(set);
  }, [simQuizData, simBanca]);

  const availableSimThemes = useMemo(() => {
    if (!simQuizData?.questions?.length) return [];
    const set = new Set(['Todos']);
    simQuizData.questions.forEach(q => {
      const t = (q.themeTitle || '').trim();
      if (t) set.add(t);
    });
    return Array.from(set);
  }, [simQuizData]);

  const filteredSimQuestions = useMemo(() => {
    if (!simQuizData?.questions) return [];
    return simQuizData.questions
      .map((q, i) => ({ ...q, originalIdx: i }))
      .filter(q => {
        const matchBanca = simQuestionsFilter === 'Todas' || (q.banca || simBanca || '').trim() === simQuestionsFilter;
        const matchTheme = simThemeFilter === 'Todos' || (q.themeTitle || '').trim() === simThemeFilter;
        return matchBanca && matchTheme;
      });
  }, [simQuizData, simQuestionsFilter, simThemeFilter, simBanca]);

  const headerTitle = {
    'codigos-biblioteca': 'Biblioteca',
    'leitor-artigos': currentLaw?.shortTitle || currentLaw?.shortName || 'Leitor',
    'simulador-ia': 'Simulador',
    'desempenho': 'Caderno'
  }[activeTab] || 'Leitor';

  const accuracyPercent = progress.stats?.questionsAnswered > 0
    ? Math.round((progress.stats.questionsCorrect / progress.stats.questionsAnswered) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-[#1c1917] font-body-regular antialiased">
      {/* HEADER MINIMALISTA E NEUTRO */}
      <header className="sticky top-0 z-40 w-full bg-[#fafaf9]/95 backdrop-blur-md border-b border-stone-200/80 pt-safe">
        <div className="max-w-3xl mx-auto h-14 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-lg font-semibold text-stone-900 truncate tracking-tight">
              {headerTitle}
            </h1>
            {activeTab === 'leitor-artigos' && (
              <span className="text-xs text-stone-500 truncate hidden sm:inline">
                • {currentLaw?.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {activeTab === 'leitor-artigos' && (
              <>
                <div className="flex items-center bg-stone-200/60 rounded-lg p-0.5 text-xs font-medium text-stone-700">
                  <button
                    onClick={handleFontDec}
                    className="px-2 py-1 rounded-md hover:bg-white transition-colors"
                    title="Diminuir fonte"
                  >
                    A-
                  </button>
                  <button
                    onClick={handleFontInc}
                    className="px-2 py-1 rounded-md hover:bg-white transition-colors"
                    title="Aumentar fonte"
                  >
                    A+
                  </button>
                </div>

                <button
                  onClick={toggleAudio}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                    isPlayingAudio
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-200/60 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isPlayingAudio ? 'stop' : 'volume_up'}
                  </span>
                  <span>{isPlayingAudio ? 'Parar' : 'Ouvir'}</span>
                </button>
              </>
            )}

            <button
              aria-label="Buscar"
              onClick={() => {
                if (activeTab === 'codigos-biblioteca') {
                  const el = document.getElementById('library-search-input');
                  if (el) el.focus();
                } else {
                  if (activeTab !== 'leitor-artigos') setActiveTab('leitor-artigos');
                  setSearchOpen(prev => !prev);
                }
              }}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-200/60 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            <button
              aria-label="Sincronização e APK"
              onClick={() => {
                setDrawerMode('apk');
                setDrawerOpen(true);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-200/60 transition-colors"
              title="Sincronização e App"
            >
              <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-4 pb-24">
        {/* =========================================================
            ABA 1: BIBLIOTECA (Limpa e Neutra)
           ========================================================= */}
        {activeTab === 'codigos-biblioteca' && (
          <div className="space-y-5">
            {/* Busca limpa */}
            <div className="bg-white rounded-xl px-3.5 py-2.5 border border-stone-200/90 flex items-center gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <span className="material-symbols-outlined text-stone-400 text-[20px] shrink-0">search</span>
              <input
                id="library-search-input"
                type="text"
                value={librarySearch}
                onChange={e => setLibrarySearch(e.target.value)}
                placeholder="Buscar lei, número ou matéria..."
                className="w-full bg-transparent text-sm text-stone-800 placeholder-stone-400 focus:outline-none"
              />
              {librarySearch && (
                <button
                  onClick={() => setLibrarySearch('')}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {/* Filtros neutros */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {areas.map(area => (
                <button
                  key={area}
                  onClick={() => setLibraryAreaFilter(area)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    libraryAreaFilter === area
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-200/60 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>

            {/* Lista de Leis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredCatalog.map(law => {
                const isSelected = law.id === selectedLawId;
                const sTitle = law.shortTitle || law.shortName;
                const sArea = (law.area || law.category || '').replace(/^Direito\s+/i, '');
                return (
                  <button
                    key={law.id}
                    onClick={() => {
                      setSelectedLawId(law.id);
                      setActiveTab('leitor-artigos');
                    }}
                    className={`text-left rounded-xl p-4 transition-all border ${
                      isSelected
                        ? 'bg-white border-stone-800 shadow-sm'
                        : 'bg-white border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-mono font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                        {sTitle}
                      </span>
                      <span className="text-[11px] text-stone-400 font-medium">
                        {sArea}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-stone-900 mb-1 leading-snug">
                      {law.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {law.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Temas sugeridos para estudo */}
            <div className="pt-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2.5 px-0.5">
                Roteiros de Estudo Rápido
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topics.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedLawId(t.lawId);
                      setSimTheme(t.title);
                      setActiveTab('simulador-ia');
                    }}
                    className="p-3 rounded-xl bg-white border border-stone-200/80 hover:border-stone-300 text-left transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-800 truncate">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">
                        {t.keywords?.join(' • ')}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-stone-400 text-[16px] shrink-0">
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            ABA 2: LEITOR (Foco 100% na leitura limpa, sem poluição)
           ========================================================= */}
        {activeTab === 'leitor-artigos' && (
          <div className="space-y-4">
            {/* Busca rápida de artigos (quando aberta) */}
            {searchOpen && (
              <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-stone-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={articleSearchQuery}
                    onChange={e => setArticleSearchQuery(e.target.value)}
                    placeholder={`Ir para artigo ou buscar termo em ${currentLaw?.shortTitle || 'CF/88'}...`}
                    className="w-full bg-transparent text-sm text-stone-800 placeholder-stone-400 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setArticleSearchQuery('');
                    }}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                {articleSearchQuery && (
                  <div className="mt-2 max-h-56 overflow-y-auto divide-y divide-stone-100">
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
                          className="w-full text-left py-2 px-2 hover:bg-stone-50 rounded-lg transition-colors flex items-start gap-2.5"
                        >
                          <span className="text-xs font-mono font-semibold text-stone-800 shrink-0 mt-0.5">
                            {art.key}
                          </span>
                          <span className="text-xs text-stone-500 line-clamp-2">
                            {art.caput}
                          </span>
                        </button>
                      );
                    })}
                    {filteredArticles.length === 0 && (
                      <p className="py-3 text-center text-xs text-stone-400">
                        Nenhum artigo encontrado.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Barra discreta de navegação entre artigos */}
            <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
              <div className="flex items-center gap-1.5 min-w-0">
                <button
                  onClick={() => setActiveTab('codigos-biblioteca')}
                  className="font-medium text-stone-700 hover:text-stone-900 underline-offset-2 hover:underline shrink-0"
                >
                  {currentLaw?.shortTitle || currentLaw?.shortName || 'CF/88'}
                </button>
                <span className="text-stone-300">/</span>
                <span className="truncate text-stone-500">
                  {activeArticle.section || 'Texto Legal'}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setCurrentArtIndex(i => Math.max(0, i - 1))}
                  disabled={currentArtIndex <= 0}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">chevron_left</span>
                  <span>Anterior</span>
                </button>
                <button
                  onClick={() => setCurrentArtIndex(i => Math.min(Math.max(0, articles.length - 1), i + 1))}
                  disabled={currentArtIndex >= articles.length - 1}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <span>Próximo</span>
                  <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Folha de Leitura da Lei (Limpa, Editorial e Neutra) */}
            <article className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
                <span className="text-sm font-mono font-semibold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-md">
                  {activeArticle.key}
                </span>
                {selectedIncisoId && (
                  <button
                    onClick={() => setSelectedIncisoId(null)}
                    className="text-xs text-stone-500 hover:text-stone-800"
                  >
                    Foco: Inciso {selectedIncisoId} (limpar)
                  </button>
                )}
              </div>

              <div
                className="space-y-4"
                style={{ fontSize: `${(fontScale / 100) * 17}px` }}
              >
                <p
                  className="font-body-legal text-stone-900 leading-relaxed text-justify"
                  style={{ fontSize: 'inherit', lineHeight: '1.75' }}
                >
                  {activeArticle.caput}
                </p>

                {activeArticle.incisos && activeArticle.incisos.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    {activeArticle.incisos.map((inc) => {
                      const isSelected = selectedIncisoId === inc.id;
                      return (
                        <div
                          key={inc.id}
                          onClick={() => setSelectedIncisoId(isSelected ? null : inc.id)}
                          className={`p-3 rounded-xl transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-stone-100 border border-stone-300'
                              : 'hover:bg-stone-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-baseline gap-3">
                            <span className="text-xs font-mono font-semibold text-stone-500 shrink-0 min-w-[24px]">
                              {inc.num}
                            </span>
                            <p
                              className="font-body-legal text-stone-800"
                              style={{ fontSize: 'inherit', lineHeight: '1.7' }}
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
                  <div className="pt-3 flex justify-center">
                    <button
                      onClick={() => setShowAllIncisos(prev => !prev)}
                      className="text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 px-3.5 py-2 rounded-lg transition-colors"
                    >
                      {showAllIncisos
                        ? 'Mostrar apenas os incisos principais (I, II, III, IV, X, XI)'
                        : `Ver todos os ${activeArticle.totalRealIncisos} incisos do Art. 5º`}
                    </button>
                  </div>
                )}
              </div>
            </article>

            {/* Barra de Ferramentas de Estudo (Discreta e Neutra) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => openExplainDrawer('geral')}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white border border-stone-200/90 hover:border-stone-400 text-stone-800 text-xs font-medium transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <span className="material-symbols-outlined text-[18px] text-stone-600">lightbulb</span>
                <span>Explicar artigo</span>
              </button>

              <button
                onClick={() => openQuizDrawer(false)}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white border border-stone-200/90 hover:border-stone-400 text-stone-800 text-xs font-medium transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <span className="material-symbols-outlined text-[18px] text-stone-600">quiz</span>
                <span>Gerar questão</span>
              </button>

              <button
                onClick={() => {
                  setDrawerMode('juris');
                  setDrawerOpen(true);
                }}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white border border-stone-200/90 hover:border-stone-400 text-stone-800 text-xs font-medium transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <span className="material-symbols-outlined text-[18px] text-stone-600">balance</span>
                <span>Jurisprudência</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            ABA 3: SIMULADOR (Com Suporte a Temas Simultâneos & Todas as Bancas)
           ========================================================= */}
        {activeTab === 'simulador-ia' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-stone-700 text-[20px]">psychology</span>
                    Simulador Jurídico com IA
                  </h2>
                  <p className="text-xs text-stone-500">
                    Geração de questões inéditas baseadas na letra da lei e súmulas
                  </p>
                </div>

                {/* Seletor de Modo de Estudo */}
                <div className="flex items-center bg-stone-100 rounded-xl p-1 text-xs font-medium self-start sm:self-auto">
                  <button
                    onClick={() => setSimStudyMode('single')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      simStudyMode === 'single'
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Tema Único
                  </button>
                  <button
                    onClick={() => setSimStudyMode('multi')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      simStudyMode === 'multi'
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>Temas Simultâneos</span>
                    {(simSelectedGoalIds || []).length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-900 text-white font-mono">
                        {simSelectedGoalIds.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* MODO TEMA ÚNICO */}
              {simStudyMode === 'single' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-stone-600">
                      Tema ou Artigo da Lei ({currentLaw?.shortTitle || 'CF/88'})
                    </label>
                    <span className="text-[11px] text-stone-400">
                      Artigo ativo: {activeArticle.key}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={simTheme}
                    onChange={e => setSimTheme(e.target.value)}
                    placeholder="Ex: Art. 5º, Inviolabilidade domiciliar, Licitações, Atos Administrativos..."
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-stone-400"
                  />
                </div>
              )}

              {/* MODO TEMAS SIMULTÂNEOS */}
              {simStudyMode === 'multi' && (
                <div className="space-y-2.5 p-3.5 rounded-xl bg-stone-50/80 border border-stone-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-stone-700">checklist</span>
                      <span className="text-xs font-semibold text-stone-900">
                        Selecione os temas simultâneos para o simulado:
                      </span>
                    </div>
                    <button
                      onClick={handleOpenNewGoalModal}
                      className="text-[11px] font-medium text-stone-900 hover:underline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Adicionar Novo Tema/Meta
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {(progress.studyGoals || DEFAULT_STUDY_GOALS).map(goal => {
                      const isSelected = (simSelectedGoalIds || []).includes(goal.id);
                      const percent = Math.min(100, Math.round(((goal.answeredCount || 0) / (goal.goalCount || 30)) * 100));
                      return (
                        <div
                          key={goal.id}
                          onClick={() => {
                            setSimSelectedGoalIds(prev => 
                              prev.includes(goal.id)
                                ? (prev.length > 1 ? prev.filter(id => id !== goal.id) : prev)
                                : [...prev, goal.id]
                            );
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-white border-stone-900 shadow-xs ring-1 ring-stone-900/10'
                              : 'bg-stone-100/70 border-stone-200/80 text-stone-600 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-semibold text-stone-900 line-clamp-1">
                              {goal.title}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 font-medium ${
                              isSelected ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'
                            }`}>
                              {goal.lawTitle || 'Lei'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-stone-500">
                            <span>Progresso da meta:</span>
                            <span className="font-mono font-medium text-stone-800">
                              {goal.answeredCount || 0}/{goal.goalCount} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className="bg-stone-800 h-full rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SELETORES: BANCA, DIFICULDADE, QUANTIDADE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Banca Examinadora
                  </label>
                  <select
                    value={simBanca}
                    onChange={e => setSimBanca(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-stone-400"
                  >
                    <option value="Todas as bancas">Todas as bancas (Mistas / Diversas)</option>
                    <option value="Cebraspe">Cebraspe</option>
                    <option value="FGV">FGV (Concursos & OAB)</option>
                    <option value="FCC">FCC (Fundação Carlos Chagas)</option>
                    <option value="Vunesp">Vunesp</option>
                    <option value="Cesgranrio">Cesgranrio (CNU / Bancos)</option>
                    <option value="Quadrix">Quadrix</option>
                    <option value="IBFC">IBFC</option>
                    <option value="Instituto AOCP">Instituto AOCP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Dificuldade
                  </label>
                  <select
                    value={simDifficulty}
                    onChange={e => setSimDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-stone-400"
                  >
                    <option>Médio (Concurso/OAB)</option>
                    <option>Avançado (Magistratura/MP/Defensoria)</option>
                    <option>Fixação (Tribunais/Policial)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Quantidade de Questões
                  </label>
                  <select
                    value={simCount}
                    onChange={e => setSimCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-stone-400"
                  >
                    <option value={3}>3 questões</option>
                    <option value={5}>5 questões</option>
                    <option value={8}>8 questões</option>
                    <option value={10}>10 questões (Recomendado)</option>
                    <option value={12}>12 questões</option>
                    <option value={15}>15 questões</option>
                    <option value={20}>20 questões (Bateria completa)</option>
                    <option value={25}>25 questões</option>
                    <option value={30}>30 questões (Simulado completo)</option>
                    <option value={40}>40 questões</option>
                    <option value={50}>50 questões (Super maratona)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateSimulation}
                disabled={simLoading}
                className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
              >
                {simLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    <span>Gerando {simCount} questões inéditas com IA...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    <span>
                      {simStudyMode === 'multi'
                        ? `Gerar Simulado Multitemático (${simCount} questões)`
                        : `Gerar Simulado (${simCount} questões)`}
                    </span>
                  </>
                )}
              </button>
            </div>

            {simQuizData && (
              <div className="space-y-3">
                {simQuizData.topicSummary && (
                  <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-700 leading-relaxed">
                    <strong className="text-stone-900 block mb-1"> Síntese do Simulado:</strong>
                    {simQuizData.topicSummary}
                  </div>
                )}

                {/* FILTROS DINÂMICOS DE BANCA E TEMA */}
                <div className="space-y-2 bg-white p-3 rounded-xl border border-stone-200/90 shadow-xs">
                  {availableSimBancas.length > 2 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      <span className="text-[11px] font-semibold text-stone-500 shrink-0">Filtrar Banca:</span>
                      {availableSimBancas.map(b => {
                        const count = b === 'Todas'
                          ? (simQuizData.questions || []).length
                          : (simQuizData.questions || []).filter(q => (q.banca || simBanca || '').trim() === b).length;
                        const isActive = simQuestionsFilter === b;
                        return (
                          <button
                            key={b}
                            onClick={() => setSimQuestionsFilter(b)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                              isActive
                                ? 'bg-stone-900 text-white'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            {b} ({count})
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {availableSimThemes.length > 2 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 border-t border-stone-100 pt-1.5">
                      <span className="text-[11px] font-semibold text-stone-500 shrink-0">Filtrar Tema:</span>
                      {availableSimThemes.map(t => {
                        const count = t === 'Todos'
                          ? (simQuizData.questions || []).length
                          : (simQuizData.questions || []).filter(q => (q.themeTitle || '').trim() === t).length;
                        const isActive = simThemeFilter === t;
                        return (
                          <button
                            key={t}
                            onClick={() => setSimThemeFilter(t)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                              isActive
                                ? 'bg-stone-900 text-white'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            {t} ({count})
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {filteredSimQuestions.map(q => {
                  const qIdx = q.originalIdx;
                  const chosen = simAnswers[qIdx];
                  const isRevealed = simRevealed[qIdx];
                  const isCorrectAns = chosen && q.answer?.trim().toUpperCase().startsWith(chosen);

                  return (
                    <div
                      key={q.id || qIdx}
                      className="rounded-2xl bg-white border border-stone-200/90 p-5 space-y-3 shadow-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-stone-500 pb-2 border-b border-stone-100">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-stone-900">
                            Questão {qIdx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-medium text-[11px]">
                            {q.banca || simBanca}
                          </span>
                          {q.themeTitle && (
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] truncate max-w-[220px]">
                              {q.themeTitle}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-stone-600 text-[11px]">
                          {q.articleRef || activeArticle.key}
                        </span>
                      </div>

                      <p className="font-body-legal text-sm text-stone-900 leading-relaxed">
                        {q.statement}
                      </p>

                      <div className="space-y-2">
                        {(q.options || []).map((opt, oIdx) => {
                          const letter = opt.trim().charAt(0).toUpperCase();
                          const isThisChosen = chosen === letter;
                          const isRight = q.answer?.trim().toUpperCase().startsWith(letter);

                          let btnStyle = 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200';
                          if (isRevealed) {
                            if (isRight) {
                              btnStyle = 'bg-emerald-50 text-emerald-950 border-emerald-300 font-medium';
                            } else if (isThisChosen && !isRight) {
                              btnStyle = 'bg-red-50 text-red-900 border-red-200';
                            }
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
                              className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-colors ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isRevealed && (
                        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5 text-stone-700">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-stone-900">
                              Gabarito: {q.answer} ({q.articleRef})
                            </p>
                            {isCorrectAns ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                Resposta Correta!
                              </span>
                            ) : (
                              <span className="text-red-700 font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">cancel</span>
                                Incorreta
                              </span>
                            )}
                          </div>
                          <p className="leading-relaxed">{q.explanation}</p>
                          {q.distractorAnalysis && (
                            <p className="text-[11px] text-stone-500 pt-1 border-t border-stone-200/50">
                              {q.distractorAnalysis}
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
            ABA 4: CADERNO, METAS & DESEMPENHO
           ========================================================= */}
        {activeTab === 'desempenho' && (
          <div className="space-y-4">
            {/* ESTATÍSTICAS RESUMO */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-xl bg-white border border-stone-200/90 p-4 shadow-xs">
                <span className="text-xs text-stone-500">Resolvidas</span>
                <p className="text-xl font-semibold text-stone-900 mt-1">
                  {progress.stats?.questionsAnswered || 0}
                </p>
              </div>
              <div className="rounded-xl bg-white border border-stone-200/90 p-4 shadow-xs">
                <span className="text-xs text-stone-500">Aproveitamento</span>
                <p className="text-xl font-semibold text-stone-900 mt-1">
                  {accuracyPercent}%
                </p>
              </div>
              <div className="rounded-xl bg-white border border-stone-200/90 p-4 shadow-xs">
                <span className="text-xs text-stone-500">Metas Concluídas</span>
                <p className="text-xl font-semibold text-stone-900 mt-1">
                  {(progress.studyGoals || []).filter(g => (g.answeredCount || 0) >= (g.goalCount || 30)).length} / {(progress.studyGoals || []).length}
                </p>
              </div>
            </div>

            {/* SEÇÃO PRINCIPAL: TEMAS SIMULTÂNEOS & METAS DE ESTUDO */}
            <div className="rounded-2xl bg-white border border-stone-200/90 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-stone-700">flag</span>
                    Metas de Estudo por Tema (Ciclos Simultâneos)
                  </h2>
                  <p className="text-xs text-stone-500">
                    Defina metas de questões para cada tema e pratique no simulador multitemático
                  </p>
                </div>
                <button
                  onClick={handleOpenNewGoalModal}
                  className="px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Adicionar Tema & Meta
                </button>
              </div>

              {/* LISTA DE METAS / TEMAS */}
              <div className="space-y-3">
                {(progress.studyGoals || DEFAULT_STUDY_GOALS).map(goal => {
                  const answered = goal.answeredCount || 0;
                  const total = goal.goalCount || 30;
                  const percent = Math.min(100, Math.round((answered / total) * 100));
                  const isFinished = answered >= total;
                  const goalAccuracy = answered > 0
                    ? Math.round(((goal.correctCount || 0) / answered) * 100)
                    : null;

                  return (
                    <div
                      key={goal.id}
                      className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/90 space-y-2.5 transition-all hover:bg-stone-50"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-stone-900">
                              {goal.title}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 font-mono text-[10px]">
                              {goal.lawTitle || 'Lei'}
                            </span>
                            {isFinished && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">verified</span>
                                Meta Atingida!
                              </span>
                            )}
                          </div>
                          {goal.focusTopic && (
                            <p className="text-xs text-stone-500 mt-0.5">
                              {goal.focusTopic}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartSimFromGoal(goal)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1 shadow-xs"
                            title="Praticar este tema no simulador"
                          >
                            <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                            Simular
                          </button>
                          <button
                            onClick={() => handleIncrementGoalProgress(goal.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-100 transition-colors"
                            title="Adicionar 1 questão resolvida"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleOpenEditGoalModal(goal)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60"
                            title="Editar meta"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50"
                            title="Excluir tema"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* BARRA DE PROGRESSO DA META */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-stone-600">
                          <span className="font-medium">
                            {answered} de {total} questões resolvidas ({percent}%)
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {goalAccuracy !== null ? `${goalAccuracy}% de acertos` : 'Nenhuma questão ainda'}
                            {goal.dailyGoal ? ` • Meta diária: ${goal.dailyGoal}` : ''}
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFinished ? 'bg-emerald-600' : 'bg-stone-900'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEÇÃO DE ANOTAÇÕES */}
            <div className="rounded-2xl bg-white border border-stone-200/90 p-5 space-y-3 shadow-xs">
              <h2 className="text-sm font-semibold text-stone-900">
                Nova Anotação ({currentLaw?.shortTitle || 'CF/88'} • {activeArticle.key})
              </h2>
              <textarea
                rows={2}
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="Escreva um resumo, prazo ou observação sobre este artigo..."
                className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-stone-400"
              />
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium"
              >
                Salvar anotação
              </button>

              {progress.notes?.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  {progress.notes.map((n, i) => (
                    <div key={n.id || i} className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                      <div className="flex items-center justify-between mb-1 text-[11px] text-stone-500">
                        <span className="font-semibold text-stone-800">
                          {n.lawTitle} • {n.article}
                        </span>
                        <span>{n.date}</span>
                      </div>
                      <p className="text-xs text-stone-700">{n.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEÇÃO DE QUESTÕES PARA REVISAR */}
            {progress.savedQuestions?.length > 0 && (
              <div className="rounded-2xl bg-white border border-stone-200/90 p-5 space-y-3 shadow-xs">
                <h2 className="text-sm font-semibold text-stone-900">
                  Caderno de Erros & Revisão ({progress.savedQuestions.length})
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {progress.savedQuestions.map((sq, idx) => (
                    <div key={sq.id || idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-stone-500 text-[11px]">
                        <span className="font-mono font-semibold text-stone-800">
                          {sq.lawTitle} • {sq.articleRef}
                          {sq.banca ? ` • ${sq.banca}` : ''}
                          {sq.themeTitle ? ` • ${sq.themeTitle}` : ''}
                        </span>
                        <span>{sq.date}</span>
                      </div>
                      <p className="text-stone-800 font-medium">{sq.statement}</p>
                      <p className="text-stone-600">
                        <strong>Gabarito {sq.answer}:</strong> {sq.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            PAINEL DESLIZANTE (DRAWER) LIMPO E NEUTRO
           ========================================================= */}
        {drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            />
            <div className="fixed inset-x-0 bottom-0 z-50 max-w-3xl mx-auto max-h-[82vh] bg-white rounded-t-2xl border-t border-stone-200 shadow-xl flex flex-col">
              <div className="w-full pt-2.5 pb-1 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-stone-300" />
              </div>

              <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-900">
                  {drawerMode === 'explain' && `Explicação • ${activeArticle.key}`}
                  {drawerMode === 'quiz' && `Questão Rápida • ${activeArticle.key}`}
                  {drawerMode === 'juris' && `Jurisprudência e Caso Prático • ${activeArticle.key}`}
                  {drawerMode === 'apk' && 'Sincronização em Nuvem & App Android'}
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-sm">
                {drawerMode === 'explain' && (
                  <>
                    {drawerLoading ? (
                      <div className="py-8 text-center text-xs text-stone-500">
                        Gerando explicação didática de {activeArticle.key}...
                      </div>
                    ) : aiExplanation ? (
                      <div className="text-xs text-stone-800 whitespace-pre-line leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                        {aiExplanation}
                      </div>
                    ) : (
                      <div className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                        {activeArticle.caput}
                      </div>
                    )}
                  </>
                )}

                {drawerMode === 'quiz' && (
                  <div className="space-y-3">
                    {drawerLoading ? (
                      <div className="py-8 text-center text-xs text-stone-500">
                        Elaborando questão inédita sobre {activeArticle.key}...
                      </div>
                    ) : drawerDynamicQuiz ? (
                      <>
                        <p className="font-body-legal text-sm text-stone-900 leading-relaxed">
                          {drawerDynamicQuiz.statement}
                        </p>
                        <div className="space-y-2">
                          {(drawerDynamicQuiz.options || []).map((opt, idx) => {
                            const letter = opt.trim().charAt(0).toUpperCase();
                            const isCorrect = drawerDynamicQuiz.answer?.trim().toUpperCase().startsWith(letter);
                            const isSelected = drawerQuizAnswer === letter;
                            let cls = 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200';
                            if (drawerQuizAnswer) {
                              if (isCorrect) cls = 'bg-emerald-50 text-emerald-950 border-emerald-300 font-medium';
                              else if (isSelected) cls = 'bg-red-50 text-red-900 border-red-200';
                            }
                            return (
                              <button
                                key={idx}
                                onClick={() => setDrawerQuizAnswer(letter)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-colors ${cls}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {drawerQuizAnswer && (
                          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
                            <p className="font-semibold text-stone-900 mb-1">
                              Gabarito: {drawerDynamicQuiz.answer}
                            </p>
                            <p>{drawerDynamicQuiz.explanation}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-body-legal text-sm text-stone-900 leading-relaxed">
                          À luz da jurisprudência do STF sobre a inviolabilidade do domicílio (Art. 5º, XI), a entrada forçada em domicílio sem mandado judicial é lícita, mesmo em período noturno, quando:
                        </p>
                        <div className="space-y-2">
                          {[
                            { k: 'A', t: 'A) O agente policial suspeitar subjetivamente de tráfico.' },
                            { k: 'B', t: 'B) Houver fundadas razões de situação de flagrante delito devidamente justificadas posteriormente.' },
                            { k: 'C', t: 'C) Houver mandado judicial expedido pelo juiz competente para cumprimento às 22h.' }
                          ].map(item => {
                            let cls = 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200';
                            if (drawerQuizAnswer) {
                              if (item.k === 'B') cls = 'bg-emerald-50 text-emerald-950 border-emerald-300 font-medium';
                              else if (drawerQuizAnswer === item.k) cls = 'bg-red-50 text-red-900 border-red-200';
                            }
                            return (
                              <button
                                key={item.k}
                                onClick={() => setDrawerQuizAnswer(item.k)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-colors ${cls}`}
                              >
                                {item.t}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    <button
                      onClick={() => openQuizDrawer(true)}
                      className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-medium"
                    >
                      Gerar nova questão inédita com IA
                    </button>
                  </div>
                )}

                {drawerMode === 'juris' && (
                  <div className="space-y-3 text-xs text-stone-700">
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                      <span className="font-mono font-semibold text-stone-900">Tema 280 / STF (Inviolabilidade Domiciliar)</span>
                      <p className="leading-relaxed">
                        A entrada forçada em domicílio sem mandado judicial só é lícita, mesmo em período noturno, quando amparada em fundadas razões, devidamente justificadas a posteriori, que indiquem que dentro da casa ocorre situação de flagrante delito.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                      <span className="font-mono font-semibold text-stone-900">Súmula Vinculante 11 / STF</span>
                      <p className="leading-relaxed">
                        Só é lícito o uso de algemas em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia.
                      </p>
                    </div>
                    <button
                      onClick={() => openExplainDrawer('jurisprudencia')}
                      className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-medium"
                    >
                      Pesquisar julgados específicos de {activeArticle.key} com IA
                    </button>
                  </div>
                )}

                {drawerMode === 'apk' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-700">
                      <p className="font-semibold text-stone-900 mb-1">Status: {syncStatus}</p>
                      <p>
                        O aplicativo busca os textos legais diretamente da base oficial no GitHub e funciona de forma autônoma no seu tablet.
                      </p>
                    </div>

                    <button
                      onClick={() => loadLawContent(selectedLawId, true)}
                      className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-medium flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">sync</span>
                      <span>Atualizar lei atual do GitHub</span>
                    </button>

                    <a
                      href={GITHUB_OTA_WEB_URL}
                      className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-medium flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      <span>Abrir versão Web na Nuvem (OTA)</span>
                    </a>

                    <a
                      href={GITHUB_APK_URL}
                      download
                      className="w-full py-3 rounded-xl bg-stone-900 text-white font-medium flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      <span>Baixar APK Android (Sem Cabo)</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* MODAL ADICIONAR / EDITAR TEMA E META */}
        {showGoalModal && (
          <>
            <div
              onClick={() => setShowGoalModal(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs transition-opacity"
            />
            <div className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] bg-white rounded-2xl border border-stone-200 shadow-2xl z-50 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-stone-700">flag</span>
                  {editingGoal ? 'Editar Tema e Meta de Estudo' : 'Novo Tema Simultâneo & Meta'}
                </h3>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* TEMA SUGERIDO / RÁPIDO */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Sugestões Rápidas de Temas:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { t: 'Direitos Fundamentais (Art. 5º)', l: 'cf88' },
                    { t: 'Administração Pública (Arts. 37-41)', l: 'cf88' },
                    { t: 'Nova Lei de Licitações (Lei 14.133)', l: 'lei-licitacoes-14133' },
                    { t: 'Direito Penal - Teoria do Crime', l: 'cod-penal' },
                    { t: 'Processo Civil - Recursos', l: 'cpc-2015' },
                    { t: 'Direito Tributário - Impostos', l: 'ctn' }
                  ].map(sug => (
                    <button
                      key={sug.t}
                      type="button"
                      onClick={() => {
                        setGoalFormTitle(sug.t);
                        setGoalFormLawId(sug.l);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                    >
                      {sug.t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Título do Tema de Estudo *
                </label>
                <input
                  type="text"
                  value={goalFormTitle}
                  onChange={e => setGoalFormTitle(e.target.value)}
                  placeholder="Ex: Direitos Sociais, Licitações, Controle de Const..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Lei ou Código Vinculado
                </label>
                <select
                  value={goalFormLawId}
                  onChange={e => setGoalFormLawId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-stone-400"
                >
                  {catalog.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.shortTitle || l.shortName} — {l.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Foco Específico (Opcional)
                </label>
                <input
                  type="text"
                  value={goalFormFocus}
                  onChange={e => setGoalFormFocus(e.target.value)}
                  placeholder="Ex: Jurisprudência do STF, Prazos recursais, Exceções à regra..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-700">
                    Meta Total de Questões
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    value={goalFormTotal}
                    onChange={e => setGoalFormTotal(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-stone-400"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[15, 30, 50, 100].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setGoalFormTotal(cnt)}
                        className="px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-600 hover:bg-stone-200"
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-700">
                    Meta Diária (Questões/dia)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={goalFormDaily}
                    onChange={e => setGoalFormDaily(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-stone-400"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[5, 10, 15, 20].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setGoalFormDaily(cnt)}
                        className="px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-600 hover:bg-stone-200"
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveGoal}
                  disabled={!goalFormTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 disabled:opacity-50"
                >
                  {editingGoal ? 'Salvar Alterações' : 'Criar Meta de Estudo'}
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* BARRA DE NAVEGAÇÃO INFERIOR LIMPA E NEUTRA */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#fafaf9]/95 backdrop-blur-md border-t border-stone-200/80 pb-safe">
        <div className="max-w-3xl mx-auto h-14 px-2 flex items-center justify-around">
          {[
            { id: 'codigos-biblioteca', icon: 'menu_book', label: 'Biblioteca' },
            { id: 'leitor-artigos', icon: 'article', label: 'Leitor' },
            { id: 'simulador-ia', icon: 'quiz', label: 'Simulador' },
            { id: 'desempenho', icon: 'bookmark_border', label: 'Caderno' }
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  active ? 'text-stone-900 font-semibold' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <span className="material-symbols-outlined text-[21px]">{tab.icon}</span>
                <span className="text-[11px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
