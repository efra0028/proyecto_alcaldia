const http = require('http');

function req(method, path, body, headers) {
  return new Promise((res, rej) => {
    const opts = {
      hostname: 'localhost', port: 3000,
      path: '/api/v1' + path, method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    const r = http.request(opts, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => {
        try { res({ status: resp.statusCode, body: JSON.parse(d || '{}') }); }
        catch { res({ status: resp.statusCode, body: d }); }
      });
    });
    r.on('error', rej);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function run() {
  let pass = 0, fail = 0;
  const ok = (n) => { console.log('  [PASS] ' + n); pass++; };
  const ko = (n, d) => { console.log('  [FAIL] ' + n + ' -- ' + d); fail++; };

  console.log('\n============================================================');
  console.log('  GAMS QR-BACKEND -- Test Suite Completo');
  console.log('============================================================');

  // 1. AUTH
  console.log('\n[1] AUTH');
  let r = await req('POST', '/auth/login', { email: 'admin@gams.gob.bo', password: 'Admin2024' });
  if (r.status === 200 && r.body.access_token) ok('POST /auth/login - Login exitoso'); else ko('Login', 'Status=' + r.status);
  const TOKEN = r.body.access_token;
  const AH = { Authorization: 'Bearer ' + TOKEN };
  if (r.body.user?.roles?.includes('SUPER_ADMIN')) ok('Login - Rol SUPER_ADMIN'); else ko('Rol SUPER_ADMIN', 'No encontrado');
  r = await req('POST', '/auth/login', { email: 'admin@gams.gob.bo', password: 'X' });
  if (r.status === 401) ok('Login incorrecto - 401'); else ko('Login incorrecto', 'Status=' + r.status);
  r = await req('GET', '/auth/me', null, AH);
  if (r.body.email === 'admin@gams.gob.bo') ok('GET /auth/me - datos correctos'); else ko('/auth/me', r.status);
  r = await req('PATCH', '/auth/change-password', { current_password: 'WRONG', new_password: 'Algo12345' }, AH);
  if (r.status === 400) ok('PATCH /auth/change-password - valida contrasena'); else ko('change-password', 'Status=' + r.status);

  // 2. ROLES
  console.log('\n[2] ROLES');
  r = await req('GET', '/roles', null, AH);
  if (r.body.length >= 2) ok('GET /roles - min 2 roles'); else ko('GET /roles', 'count=' + r.body.length);
  const rolNombre = 'TEST_ROL_' + Date.now();
  r = await req('POST', '/roles', { nombre: rolNombre, descripcion: 'Prueba' }, AH);
  if (r.body.id > 0) ok('POST /roles - crear'); else ko('POST /roles', r.status + ' ' + JSON.stringify(r.body));
  r = await req('POST', '/roles', { nombre: rolNombre, descripcion: 'Prueba' }, AH);
  if (r.status === 409) ok('POST /roles - duplicado 409'); else ko('Roles duplicado', 'Status=' + r.status);

  // 3. USUARIOS
  console.log('\n[3] USUARIOS');
  r = await req('GET', '/usuarios', null, AH);
  const adm = Array.isArray(r.body) && r.body.find(u => u.email === 'admin@gams.gob.bo');
  if (adm) ok('GET /usuarios - admin incluido'); else ko('GET /usuarios', 'admin no encontrado');
  const email = 'test' + Date.now() + '@gams.bo';
  r = await req('POST', '/usuarios', { nombre: 'Test User', email, password: 'Test12345', rol_ids: [1] }, AH);
  if (r.body.id > 0) ok('POST /usuarios - crear'); else ko('POST /usuarios', r.status + ' ' + JSON.stringify(r.body));
  const uid = r.body.id;
  r = await req('POST', '/usuarios', { nombre: 'Test2', email, password: 'Test12345', rol_ids: [1] }, AH);
  if (r.status === 409) ok('POST /usuarios - email duplicado 409'); else ko('Email duplicado', 'Status=' + r.status);
  r = await req('PATCH', '/usuarios/' + uid + '/toggle', null, AH);
  if (r.body.is_active === false) ok('PATCH /usuarios toggle - desactiva'); else ko('Toggle usuario', JSON.stringify(r.body));

  // 4. SISTEMAS
  console.log('\n[4] SISTEMAS');
  r = await req('POST', '/sistemas', { nombre: 'Sys' + Date.now(), descripcion: 'Test', color_hex: '#FF0000' }, AH);
  if (r.body.api_key?.startsWith('gams_')) ok('POST /sistemas - api_key correcta'); else ko('POST /sistemas', JSON.stringify(r.body));
  const sistemaId = r.body.id;
  const oldKey = r.body.api_key;
  r = await req('PATCH', '/sistemas/' + sistemaId + '/regenerar-key', null, AH);
  if (r.body.api_key?.startsWith('gams_') && r.body.api_key !== oldKey) ok('Regenerar api_key - nueva diferente'); else ko('Regenerar key', r.status);

  // 5. CATALOGOS
  console.log('\n[5] CATALOGOS');
  r = await req('GET', '/estados-registro', null, AH);
  const activo = Array.isArray(r.body) && r.body.find(e => e.nombre === 'ACTIVO');
  if (activo && activo.bloquea_qr === false) ok('GET /estados-registro - ACTIVO ok'); else ko('Estados registro', 'ACTIVO no encontrado');
  r = await req('GET', '/estados-publicacion', null, AH);
  if (r.body.length >= 3) ok('GET /estados-publicacion - min 3'); else ko('Estados pub', 'count=' + r.body.length);

  // 6. REGISTROS
  console.log('\n[6] REGISTROS');
  const refExt = 'PLACA-' + Date.now();
  const regBody = { sistema_id: sistemaId, referencia_externa: refExt, datos_display: { nombre: 'Juan', placa: refExt }, fecha_inicio: '2025-01-01', fecha_vencimiento: '2026-12-31', estado_id: 1 };
  r = await req('POST', '/registros', regBody, AH);
  if (r.body.id) ok('POST /registros - crear'); else ko('POST /registros', r.status + ' ' + JSON.stringify(r.body));
  const regId = r.body.id;
  r = await req('POST', '/registros', regBody, AH);
  if (r.status === 409) ok('POST /registros - duplicado 409'); else ko('Registro duplicado', 'Status=' + r.status);
  r = await req('GET', '/registros?limite=5', null, AH);
  if (r.body.data && r.body.total !== undefined) ok('GET /registros - respuesta paginada'); else ko('Paginacion', JSON.stringify(r.body));
  r = await req('PATCH', '/registros/' + regId + '/suspender', {}, AH);
  if (r.status === 400) ok('Suspender sin motivo - 400'); else ko('Suspender validacion', 'Status=' + r.status);
  await req('PATCH', '/registros/' + regId + '/suspender', { motivo: 'Test' }, AH);
  r = await req('PATCH', '/registros/' + regId + '/activar', null, AH);
  if (r.body.motivo_suspension === null || r.body.motivo_suspension === undefined) ok('Activar registro - limpia suspension'); else ko('Activar', JSON.stringify(r.body.motivo_suspension));

  // 7. QR
  console.log('\n[7] QR CODIGOS');
  r = await req('POST', '/qr-codigos/generar/' + regId, null, AH);
  if (r.body.codigo_unico && r.body.imagen_qr_url) ok('POST /qr-codigos/generar - QR con imagen'); else ko('Generar QR', JSON.stringify(r.body));
  const codigoUnico = r.body.codigo_unico;
  r = await req('POST', '/qr-codigos/generar/' + regId, null, AH);
  if (r.status === 409) ok('Generar QR duplicado - 409'); else ko('QR duplicado', 'Status=' + r.status);
  r = await req('GET', '/qr-codigos/scan/' + codigoUnico);
  if (r.body.valido === true && r.body.resultado === 'VALIDO') ok('GET /scan/:uuid - PUBLICO VALIDO'); else ko('Scan QR', JSON.stringify(r.body));
  if (r.body.datos) ok('Scan - incluye datos_display'); else ko('Scan datos', 'Sin datos');
  r = await req('GET', '/qr-codigos/scan/00000000-0000-0000-0000-000000000000');
  if (r.body.valido === false) ok('Scan invalido - valido=false'); else ko('Scan invalido', JSON.stringify(r.body));

  // 8. ESCANEOS
  console.log('\n[8] ESCANEOS');
  r = await req('GET', '/escaneos/estadisticas', null, AH);
  if (r.body.total >= 1) ok('GET /escaneos/estadisticas - total>=1'); else ko('Estadisticas', 'total=' + r.body.total);
  r = await req('GET', '/escaneos/recientes', null, AH);
  if (r.status === 200) ok('GET /escaneos/recientes - 200'); else ko('Recientes', 'Status=' + r.status);

  // 9. PUBLICACIONES
  console.log('\n[9] PUBLICACIONES');
  r = await req('POST', '/tipos-publicacion', { sistema_id: sistemaId, nombre: 'Tipo' + Date.now(), descripcion: 'Test' }, AH);
  if (r.body.id > 0) ok('POST /tipos-publicacion - crear'); else ko('Tipo pub', r.status + ' ' + JSON.stringify(r.body));
  const tipoId = r.body.id;
  r = await req('POST', '/publicaciones', { tipo_id: tipoId, titulo: 'Pub Test', contenido: { texto: 'Hola' }, estado_id: 1 }, AH);
  if (r.body.id) ok('POST /publicaciones - crear'); else ko('POST publicaciones', r.status + ' ' + JSON.stringify(r.body));
  r = await req('GET', '/publicaciones');
  if (r.status === 200) ok('GET /publicaciones - PUBLICO sin auth'); else ko('GET publicaciones', 'Status=' + r.status);

  // 10. AUDITORIA
  console.log('\n[10] AUDITORIA');
  r = await req('GET', '/auditoria', null, AH);
  if (Array.isArray(r.body) && r.body.length >= 1) ok('GET /auditoria - interceptor activo'); else ko('Auditoria', 'vacio o error: ' + JSON.stringify(r.body));
  r = await req('GET', '/auditoria');
  if (r.status === 401) ok('GET /auditoria sin token - 401'); else ko('Auditoria auth', 'Status=' + r.status);

  // 11. SEGURIDAD
  console.log('\n[11] SEGURIDAD');
  r = await req('GET', '/usuarios', null, { Authorization: 'Bearer TOKEN_INVALIDO' });
  if (r.status === 401) ok('JWT invalido - 401'); else ko('JWT invalido', 'Status=' + r.status);

  // RESULTADO FINAL
  const total = pass + fail;
  console.log('\n============================================================');
  if (fail === 0) console.log('  RESULTADO: ' + pass + '/' + total + ' tests pasaron -- BACKEND COMPLETO AL 100%');
  else console.log('  RESULTADO: ' + pass + '/' + total + ' pasaron | ' + fail + ' FALLARON');
  console.log('============================================================\n');
}
run().catch(e => { console.error('ERROR FATAL:', e.message); process.exit(1); });
