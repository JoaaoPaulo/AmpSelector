# AmpSelector

Sistema pessoal de presets para o pedal multiefeitos **Cuvave Cube Baby**.
Mostra um desenho interativo do pedal na tela (knobs e footswitches), guarda
uma biblioteca de presets por música/artista, e permite buscar, editar e
dar feedback sobre cada um.

Os presets são criados por uma sessão do Claude Code (pesquisando o tom
usado na gravação original de cada música) e depois testados na guitarra
física — veja `CLAUDE.md` para o workflow completo.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

- `src/data/presets.ts` — biblioteca de presets (fonte de verdade)
- `src/data/pedal-spec.ts` — definição dos knobs e das listas de tipos de amp/cabinet/modulação
- `src/data/calibration.md` — histórico do que já foi aprendido com o feedback do usuário
- `src/components/Pedal.tsx` — desenho interativo do pedal
- `src/lib/presetStore.ts` — leitura da biblioteca + sobreposição de edições locais (`localStorage`)

## Deploy

Deploy estático via [Vercel](https://vercel.com/new) — basta conectar o
repositório, sem variáveis de ambiente ou banco de dados necessários.
