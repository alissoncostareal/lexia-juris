import http from 'node:http';

async function testBackend() {
  process.env.PORT = '3461';
  console.log('--- Iniciando servidor de teste na porta 3461 ---');
  
  // Import dynamically
  await import('./src/server.mjs');
  
  // Wait 1 second for listen
  await new Promise(r => setTimeout(r, 1200));

  const base = 'http://127.0.0.1:3461';

  // Test 1: GET /api/status
  console.log('\n[1] Testando GET /api/status...');
  const res1 = await fetch(`${base}/api/status`);
  const data1 = await res1.json();
  if (data1.status === 'ok' && data1.ollama) {
    console.log('✅ /api/status OK:', JSON.stringify(data1));
  } else {
    throw new Error('Falha no teste de /api/status');
  }

  // Test 2: GET /api/catalog
  console.log('\n[2] Testando GET /api/catalog...');
  const res2 = await fetch(`${base}/api/catalog`);
  const data2 = await res2.json();
  if (data2.laws && data2.laws.length > 10) {
    console.log(`✅ /api/catalog OK: ${data2.laws.length} leis no acervo`);
  } else {
    throw new Error('Falha no teste de /api/catalog');
  }

  // Test 3: GET /api/law/cf88
  console.log('\n[3] Testando GET /api/law/cf88...');
  const res3 = await fetch(`${base}/api/law/cf88`);
  const data3 = await res3.json();
  if (data3.law && data3.law.id === 'cf88') {
    console.log(`✅ /api/law/cf88 OK: título="${data3.law.title}", tamanho=${data3.totalLength || 0}`);
  } else {
    throw new Error('Falha no teste de /api/law/cf88');
  }

  // Test 4: POST /api/progress & GET /api/progress
  console.log('\n[4] Testando POST e GET /api/progress...');
  const postRes = await fetch(`${base}/api/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stats: { questionsAnswered: 5, questionsCorrect: 4 },
      note: { id: 999, text: 'Nota de teste automatizado', date: '23/10/2026' }
    })
  });
  const postData = await postRes.json();
  if (postData.ok && postData.progress) {
    console.log('✅ POST /api/progress OK: progresso gravado');
  } else {
    throw new Error('Falha no POST /api/progress');
  }

  const getRes = await fetch(`${base}/api/progress`);
  const getData = await getRes.json();
  if (getData.stats && getData.stats.questionsAnswered >= 5) {
    console.log('✅ GET /api/progress OK: persistência validada');
  } else {
    throw new Error('Falha no GET /api/progress');
  }

  console.log('\n========================================');
  console.log('🎉 TODOS OS TESTES DO BACKEND PASSARAM!');
  console.log('========================================\n');
  process.exit(0);
}

testBackend().catch(err => {
  console.error('❌ ERRO NOS TESTES:', err);
  process.exit(1);
});
