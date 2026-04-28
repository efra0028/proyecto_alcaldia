$BASE = "http://localhost:3000/api/v1"
$pass = 0
$fail = 0

function OK { param($n) Write-Host "  [PASS] $n" -ForegroundColor Green; $script:pass++ }
function KO { param($n,$d) Write-Host "  [FAIL] $n --- $d" -ForegroundColor Red; $script:fail++ }

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  GAMS QR-BACKEND -- Test Suite Completo" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# ── 1. AUTH
Write-Host "`n[1] AUTH" -ForegroundColor Yellow

$loginBody = '{"email":"admin@gams.gob.bo","password":"Admin2024"}'
$loginResp = Invoke-RestMethod "$BASE/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$TOKEN = $loginResp.access_token
$H = @{ Authorization = "Bearer $TOKEN" }

if ($TOKEN.Length -gt 20) { OK "POST /auth/login - Login exitoso" } else { KO "POST /auth/login" "Sin token" }
if ($loginResp.user.roles -contains "SUPER_ADMIN") { OK "POST /auth/login - Rol SUPER_ADMIN ok" } else { KO "Rol SUPER_ADMIN" "No encontrado" }

try {
  Invoke-RestMethod "$BASE/auth/login" -Method POST -Body '{"email":"admin@gams.gob.bo","password":"WRONG"}' -ContentType "application/json" | Out-Null
  KO "Login incorrecto da 401" "No lanzo error"
}
catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 401) { OK "POST /auth/login - Credenciales incorrectas dan 401" } else { KO "Login incorrecto" "Status $code" }
}

$me = Invoke-RestMethod "$BASE/auth/me" -Headers $H
if ($me.email -eq "admin@gams.gob.bo") { OK "GET /auth/me - Retorna datos correctos" } else { KO "GET /auth/me" "Email incorrecto" }

try {
  $b = '{"current_password":"WRONG","new_password":"Algo12345"}'
  Invoke-RestMethod "$BASE/auth/change-password" -Method PATCH -Headers $H -Body $b -ContentType "application/json" | Out-Null
  KO "change-password valida contrasena" "No rechazo"
}
catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 400) { OK "PATCH /auth/change-password - Valida contrasena actual" } else { KO "change-password" "Status $code" }
}

# ── 2. ROLES
Write-Host "`n[2] ROLES" -ForegroundColor Yellow

$roles = Invoke-RestMethod "$BASE/roles" -Headers $H
if ($roles.Count -ge 2) { OK "GET /roles - Lista min 2 roles" } else { KO "GET /roles" "Count=$($roles.Count)" }

$rolNombre = "TEST_ROL_$(Get-Random)"
$rolBody = "{`"nombre`":`"$rolNombre`",`"descripcion`":`"Prueba`"}"
$rolCreado = Invoke-RestMethod "$BASE/roles" -Method POST -Headers $H -Body $rolBody -ContentType "application/json"
if ($rolCreado.id -gt 0) { OK "POST /roles - Crear rol" } else { KO "POST /roles" "Sin ID" }

try {
  Invoke-RestMethod "$BASE/roles" -Method POST -Headers $H -Body $rolBody -ContentType "application/json" | Out-Null
  KO "POST /roles duplicado da 409" "No rechazo"
}
catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 409) { OK "POST /roles - Duplicado da 409" } else { KO "Roles duplicado" "Status $code" }
}

# ── 3. USUARIOS
Write-Host "`n[3] USUARIOS" -ForegroundColor Yellow

$usuarios = Invoke-RestMethod "$BASE/usuarios" -Headers $H
$adm = $usuarios | Where-Object { $_.email -eq "admin@gams.gob.bo" }
if ($null -ne $adm) { OK "GET /usuarios - Admin incluido en lista" } else { KO "GET /usuarios" "Admin no encontrado" }

$emailTest = "test_$(Get-Random)@gams.bo"
$uBody = "{`"nombre`":`"Test User`",`"email`":`"$emailTest`",`"password`":`"Test12345`",`"rol_ids`":[1]}"
$userCreado = Invoke-RestMethod "$BASE/usuarios" -Method POST -Headers $H -Body $uBody -ContentType "application/json"
if ($userCreado.id -gt 0) { OK "POST /usuarios - Crear usuario" } else { KO "POST /usuarios" "Sin ID" }

try {
  Invoke-RestMethod "$BASE/usuarios" -Method POST -Headers $H -Body $uBody -ContentType "application/json" | Out-Null
  KO "Email duplicado da 409" "No rechazo"
}
catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 409) { OK "POST /usuarios - Email duplicado da 409" } else { KO "Email duplicado" "Status $code" }
}

$tog = Invoke-RestMethod "$BASE/usuarios/$($userCreado.id)/toggle" -Method PATCH -Headers $H
if ($tog.is_active -eq $false) { OK "PATCH /usuarios/:id/toggle - Desactiva usuario" } else { KO "Toggle usuario" "Sigue activo" }

# ── 4. SISTEMAS
Write-Host "`n[4] SISTEMAS" -ForegroundColor Yellow

$sNombre = "TestSis$(Get-Random)"
$sBody = "{`"nombre`":`"$sNombre`",`"descripcion`":`"Prueba`",`"color_hex`":`"#FF0000`"}"
$sistema = Invoke-RestMethod "$BASE/sistemas" -Method POST -Headers $H -Body $sBody -ContentType "application/json"
if ($sistema.api_key -like "gams_*") { OK "POST /sistemas - Crea con api_key gams_*" } else { KO "POST /sistemas" "api_key invalida" }

$regen = Invoke-RestMethod "$BASE/sistemas/$($sistema.id)/regenerar-key" -Method PATCH -Headers $H
if ($regen.api_key -like "gams_*" -and $regen.api_key -ne $sistema.api_key) {
  OK "PATCH /sistemas/:id/regenerar-key - Nueva key diferente"
} else { KO "Regenerar key" "Igual o invalida" }

# ── 5. CATALOGOS
Write-Host "`n[5] CATALOGOS DE ESTADOS" -ForegroundColor Yellow

$estReg = Invoke-RestMethod "$BASE/estados-registro" -Headers $H
$activo = $estReg | Where-Object { $_.nombre -eq "ACTIVO" }
if ($null -ne $activo -and $activo.bloquea_qr -eq $false) {
  OK "GET /estados-registro - ACTIVO con bloquea_qr=false"
} else { KO "GET /estados-registro" "ACTIVO no encontrado" }

$estPub = Invoke-RestMethod "$BASE/estados-publicacion" -Headers $H
if ($estPub.Count -ge 3) { OK "GET /estados-publicacion - Min 3 estados" } else { KO "GET /estados-publicacion" "Solo $($estPub.Count)" }

# ── 6. REGISTROS
Write-Host "`n[6] REGISTROS" -ForegroundColor Yellow

$refExt = "PLACA-$(Get-Random)"
$rBody = "{`"sistema_id`":`"$($sistema.id)`",`"referencia_externa`":`"$refExt`",`"datos_display`":{`"nombre`":`"Juan Test`"},`"fecha_inicio`":`"2025-01-01`",`"fecha_vencimiento`":`"2026-12-31`",`"estado_id`":1}"
$registro = Invoke-RestMethod "$BASE/registros" -Method POST -Headers $H -Body $rBody -ContentType "application/json"
if ($registro.id.Length -gt 0) { OK "POST /registros - Crear registro" } else { KO "POST /registros" "Sin ID" }

try {
  Invoke-RestMethod "$BASE/registros" -Method POST -Headers $H -Body $rBody -ContentType "application/json" | Out-Null
  KO "Referencia duplicada da 409" "No rechazo"
}
catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 409) { OK "POST /registros - Referencia duplicada da 409" } else { KO "Registro duplicado" "Status $code" }
}

$pag = Invoke-RestMethod "$BASE/registros?limite=5" -Headers $H
if ($pag.PSObject.Properties.Name -contains "data" -and $pag.PSObject.Properties.Name -contains "total") {
  OK "GET /registros - Respuesta paginada con data+total"
} else { KO "Paginacion" "Sin estructura paginada" }

try {
  Invoke-RestMethod "$BASE/registros/$($registro.id)/suspender" -Method PATCH -Headers $H -Body "{}" -ContentType "application/json" | Out-Null
  KO "Suspender sin motivo da 400" "No rechazo"
}
catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 400) { OK "PATCH /registros/:id/suspender - Sin motivo da 400" } else { KO "Suspender validacion" "Status $code" }
}

Invoke-RestMethod "$BASE/registros/$($registro.id)/suspender" -Method PATCH -Headers $H -Body '{"motivo":"Prueba"}' -ContentType "application/json" | Out-Null
$act = Invoke-RestMethod "$BASE/registros/$($registro.id)/activar" -Method PATCH -Headers $H
if ($null -eq $act.motivo_suspension) { OK "PATCH /registros/:id/activar - Limpia suspension" } else { KO "Activar registro" "motivo no limpiado" }

# ── 7. QR CODIGOS
Write-Host "`n[7] QR CODIGOS" -ForegroundColor Yellow

$qr = Invoke-RestMethod "$BASE/qr-codigos/generar/$($registro.id)" -Method POST -Headers $H
if ($qr.codigo_unico.Length -gt 0 -and $qr.imagen_qr_url -like "*localhost*") {
  OK "POST /qr-codigos/generar/:id - Genera QR con imagen"
} else { KO "Generar QR" "Sin codigo_unico o imagen" }

try {
  Invoke-RestMethod "$BASE/qr-codigos/generar/$($registro.id)" -Method POST -Headers $H | Out-Null
  KO "QR duplicado da 409" "No rechazo"
}
catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 409) { OK "POST /qr-codigos/generar - Duplicado da 409" } else { KO "QR duplicado" "Status $code" }
}

$scan = Invoke-RestMethod "$BASE/qr-codigos/scan/$($qr.codigo_unico)"
if ($scan.valido -eq $true -and $scan.resultado -eq "VALIDO") {
  OK "GET /qr-codigos/scan/:uuid - PUBLICO retorna VALIDO"
} else { KO "Scan QR" "valido=$($scan.valido)" }

if ($null -ne $scan.datos) { OK "GET /qr-codigos/scan - Incluye datos_display" } else { KO "Scan datos" "Sin datos" }

$sinvalido = Invoke-RestMethod "$BASE/qr-codigos/scan/00000000-0000-0000-0000-000000000000"
if ($sinvalido.valido -eq $false) { OK "GET /qr-codigos/scan/INVALIDO - Retorna valido=false" } else { KO "Scan invalido" "No retorno false" }

$imgNombre = $qr.imagen_qr_url.Split("/")[-1]
try {
  $imgResp = Invoke-WebRequest "http://localhost:3000/public/qr/$imgNombre" -UseBasicParsing
  if ($imgResp.StatusCode -eq 200) { OK "GET /public/qr/*.png - Imagen PNG accesible" } else { KO "Imagen QR" "Status $($imgResp.StatusCode)" }
}
catch { KO "Imagen QR" $_.Exception.Message }

# ── 8. ESCANEOS
Write-Host "`n[8] ESCANEOS" -ForegroundColor Yellow

$stats = Invoke-RestMethod "$BASE/escaneos/estadisticas" -Headers $H
if ($stats.total -ge 1) { OK "GET /escaneos/estadisticas - total >= 1" } else { KO "Estadisticas" "total=0" }

$recientes = Invoke-RestMethod "$BASE/escaneos/recientes" -Headers $H
if ($null -ne $recientes) { OK "GET /escaneos/recientes - Responde correctamente" } else { KO "Recientes" "Error" }

# ── 9. PUBLICACIONES
Write-Host "`n[9] PUBLICACIONES" -ForegroundColor Yellow

$tpBody = "{`"sistema_id`":`"$($sistema.id)`",`"nombre`":`"TipoPub$(Get-Random)`",`"descripcion`":`"Test`"}"
$tipoPub = Invoke-RestMethod "$BASE/tipos-publicacion" -Method POST -Headers $H -Body $tpBody -ContentType "application/json"
if ($tipoPub.id -gt 0) { OK "POST /tipos-publicacion - Crear tipo" } else { KO "POST /tipos-publicacion" "Sin ID" }

$pubBody = "{`"tipo_id`":$($tipoPub.id),`"titulo`":`"Pub Test`",`"contenido`":{`"texto`":`"Hola`"},`"estado_id`":1}"
$pub = Invoke-RestMethod "$BASE/publicaciones" -Method POST -Headers $H -Body $pubBody -ContentType "application/json"
if ($pub.id.Length -gt 0) { OK "POST /publicaciones - Crear publicacion" } else { KO "POST /publicaciones" "Sin ID" }

$pubPublicas = Invoke-RestMethod "$BASE/publicaciones"
if ($pubPublicas -is [Array]) { OK "GET /publicaciones - PUBLICO, responde sin auth" } else { KO "GET /publicaciones" "No es array" }

# ── 10. AUDITORIA
Write-Host "`n[10] AUDITORIA" -ForegroundColor Yellow

$audit = Invoke-RestMethod "$BASE/auditoria" -Headers $H
if ($audit.Count -ge 1) { OK "GET /auditoria - Interceptor registro operaciones" } else { KO "GET /auditoria" "Vacio, interceptor no funciono" }

try {
  Invoke-RestMethod "$BASE/auditoria" | Out-Null
  KO "GET /auditoria sin token da 401" "No rechazo"
}
catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 401) { OK "GET /auditoria - Sin token da 401" } else { KO "Auditoria auth" "Status $code" }
}

# ── 11. SEGURIDAD
Write-Host "`n[11] SEGURIDAD" -ForegroundColor Yellow

try {
  Invoke-RestMethod "$BASE/usuarios" -Headers @{ Authorization = "Bearer TOKEN_INVALIDO" } | Out-Null
  KO "JWT invalido da 401" "No rechazo"
}
catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 401) { OK "JWT invalido da 401" } else { KO "JWT invalido" "Status $code" }
}

try {
  $sw = Invoke-WebRequest "http://localhost:3000/api/docs" -UseBasicParsing
  if ($sw.StatusCode -eq 200) { OK "Swagger UI accesible en /api/docs" } else { KO "Swagger" "Status $($sw.StatusCode)" }
}
catch { KO "Swagger" $_.Exception.Message }

# ── RESULTADO FINAL
$total = $pass + $fail
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
if ($fail -eq 0) {
  Write-Host "  RESULTADO: $pass/$total tests pasaron -- BACKEND OK" -ForegroundColor Green
} else {
  Write-Host "  RESULTADO: $pass/$total pasaron | $fail FALLARON" -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
