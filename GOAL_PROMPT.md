# Prompt para pegar en Grok Build

Instala Grok Build si no lo tienes:

```bash
curl -fsSL https://x.ai/cli/install.sh | bash
```

En el clone local:

```bash
git clone https://github.com/angelporlan/ceferly.git
cd ceferly
grok   # o el binario `grok` de Grok Build
```

Luego pega esto:

```
/goal Convierte Ceferly en un SaaS de inglés estilo Duolingo centrado en titulaciones Cambridge (B1 Preliminary, B2 First, C1 Advanced, luego C2). Opera en bucle continuo sin preguntarme. En cada incremento sigue: idea → spec → plan → TDD → implement → tests → QA UI → review → PR/CI → fix → done, y al terminar un ciclo elige solo la siguiente mejora de mayor impacto.

Lee AGENTS.md y AGENT_CHANGELOG.md. Stack real: frontend React 19 + Vite + Tailwind en :4200, backend Express ESM + Sequelize/MySQL en :4000, docker-compose en la raíz. No rompas la UI Duolingo (verde #58CC02).

Done del MVP (sigue iterando hasta cubrirlo, luego mejoras constantes):
- ≥100 ejercicios originales estilo Cambridge (B1+B2+C1, Use of English parts 1–4 como mínimo)
- E2E: auth → nivel → categoría → player → intento persistido → resultado → explicación IA
- Gamificación: vidas, streak, monedas, shop, leaderboard, meta diaria
- Tests + build verdes y workflow CI
- Rutas / categories / player / results / shop / leaderboard sin pantallas vacías ni errores de consola

Prioridad actual según AGENT_CHANGELOG: gamificación en frontend (monedas al completar, vidas, badges de racha en Header) salvo que la auditoría demuestre un hueco E2E o de contenido más grave.

Verifica cada paso (tests, build, smoke API/UI). Abre ramas agent/feat-* y PRs. Actualiza AGENT_CHANGELOG.md al cerrar cada ciclo. Contenido original, no copies papers oficiales.
```

Comandos útiles mientras corre:

```
/goal status
/goal pause
/goal resume
/goal clear
```
