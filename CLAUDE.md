@AGENTS.md

# AmpSelector — guia do projeto

Sistema pessoal para montar e guardar presets do pedal multiefeitos
**Cuvave Cube Baby**, com um desenho interativo do pedal na tela. O usuário
não sabe regular o pedal sozinho — quem decide os valores de cada preset,
pesquisando o tom/equipamento usado na gravação original de cada música, é
o Claude, numa conversa como esta.

## Como as peças se encaixam

- `src/data/presets.ts` é a fonte de verdade da biblioteca. Cada preset é
  criado por uma sessão do Claude e depois testado pelo usuário na guitarra
  física.
- `src/data/calibration.md` guarda o histórico de acertos/erros
  acumulados. **Leia esse arquivo inteiro antes de criar ou ajustar
  qualquer preset** — ele registra padrões já observados (ex: "o palpite de
  TIME costuma ficar alto demais para rock clássico") que devem influenciar
  o próximo palpite.
- `src/data/pedal-spec.ts` define os knobs, suas faixas de valor e as
  listas de tipos de amp/cabinet/modulação.
- `src/lib/audioEngine.ts` traduz um preset numa cadeia de Web Audio para
  o braço virtual (`/tocar`): corda sintetizada por Karplus-Strong →
  tone/captador da guitarra → amp (waveshaper) → cabinet (filtros) →
  delay/modulação → reverb → volume. É uma **aproximação**, não o DSP do
  Cube Baby. `AMP_PROFILES` e `CAB_PROFILES` são indexados na mesma ordem
  de `AMP_TYPES` e `CAB_TYPES` — ao mexer numa lista, ajuste a outra.
- O app **não controla o pedal físico de verdade** — não existe integração
  de software com o Cube Baby (Bluetooth dele só serve pra tocar áudio, não
  pra sincronizar presets). O app é uma ficha de referência visual; o
  usuário reproduz manualmente os valores no pedal.
- Ajustes feitos pelo usuário direto na interface (arrastar um knob, mudar
  status, registrar feedback) ficam salvos em `localStorage`, por cima dos
  dados de `presets.ts` (ver `src/lib/presetStore.ts`). Isso **não** atualiza
  o arquivo do repositório sozinho. Quando o usuário colar aqui o JSON que o
  botão "copiar alterações" gerou, aplique manualmente em `presets.ts` e
  registre a lição aprendida em `calibration.md`.

## Workflow para criar um preset novo

1. Descubra a música e o artista (se possível, o trecho específico: riff,
   intro, solo etc. — o tom pode mudar dentro da mesma música).
2. Pesquise o tom/equipamento usado na gravação original: amplificador,
   guitarra/captador usado, efeitos (delay, reverb, modulação), afinação,
   capotraste, região do braço.
3. Releia `src/data/calibration.md` e aplique os padrões relevantes para
   esse gênero/artista/tipo de amp.
4. Adicione um novo objeto `Preset` em `src/data/presets.ts`, com
   `status: "rascunho-ia"` e um campo `reasoning` explicando a decisão em
   linguagem simples (o usuário vai ler isso).
5. Preencha `guitar` com tom, capotraste, captador e uma dica de execução —
   isso é tão importante quanto os knobs.
6. Rode `npm run lint` e `npm run build` antes de commitar.
7. Faça commit e push — o deploy no Vercel é automático.

## Workflow para aplicar feedback

1. Leia o feedback (tags rápidas + nota livre) que o usuário descreveu ou
   colou.
2. Ajuste os valores do preset em `presets.ts` e atualize `status`
   (`testado-aprovado` quando o usuário confirmar que ficou bom,
   `precisa-ajuste` se ainda não bateu).
3. Registre em `src/data/calibration.md` a lição generalizável: o que foi
   corrigido e para qual contexto (gênero/artista/tipo de amp) essa lição
   vale — não só para aquela música específica.

## A guitarra do usuário

É uma **Stratocaster**, com captadores single coil e chave de 5 posições.
Todo preset é escrito para ela. Quando a gravação original usa guitarra de
humbucker, o preset precisa compensar — veja a entrada correspondente em
`calibration.md`.

## O que já foi confirmado no manual (não invente nomes)

- **TYPE**: 9 posições de preamp, **sem nome** no aparelho. É um knob
  numerado que vai do limpo cristalino ao high gain. As descrições em
  `AMP_TYPES` são nossa leitura desse gradiente, não nomes oficiais — nunca
  escreva "estilo Marshall JCM800" como se fosse o nome da posição.
- **IR CAB**: 9 posições. A primeira **desliga** a simulação de gabinete; as
  outras 8 são cabinets embutidos, também sem nome, substituíveis por IRs
  próprios via USB.
- **MOD**: knob **contínuo**, não um seletor. Centro (5) desliga, a metade
  de baixo é Chorus e a de cima é Phaser, com intensidade crescendo
  conforme se afasta do centro. Use `formatMod()` para exibir.
- Os índices guardados nos presets são posições do knob, então **mudar a
  ordem de `AMP_TYPES` ou `CAB_TYPES` quebra todos os presets salvos**.
