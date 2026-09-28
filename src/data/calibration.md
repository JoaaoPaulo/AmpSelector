# Calibração — o que já aprendemos

Este arquivo é o "diário de bordo" do sistema. Toda vez que um preset é
testado na guitarra física e o usuário dá feedback, uma **lição
generalizável** deve ser registrada aqui — não o feedback bruto (esse já
fica guardado no próprio preset, em `presets.ts`), mas o padrão que deve
influenciar os próximos palpites.

Antes de criar ou ajustar qualquer preset, releia este arquivo inteiro.

Formato sugerido por entrada:

```
## [data] — [contexto: gênero / artista / tipo de amp]
- Observado: o que o usuário corrigiu e em qual preset
- Ajuste a aplicar no futuro: como isso deve mudar o próximo palpite nesse contexto
```

---

## 2026-09-28 — a guitarra do usuário é uma Stratocaster

- **Observado**: o preset do solo de Sweet Child O' Mine saiu copiando o rig
  do Slash (Les Paul, humbucker de ponte) e soou errado na guitarra do
  usuário, que é uma Strato de captadores single coil com chave de 3
  posições (ponte / centro / braço).
- **Ajuste a aplicar no futuro**: **todo** preset é para uma Stratocaster.
  Quando a gravação original for de guitarra com humbucker (Les Paul, SG,
  Explorer — Slash, Hetfield, Angus Young, etc.), não copie os valores
  direto: single coil tem menos saída e menos médio, e mais brilho. Suba
  o GAIN em torno de 1 ponto e/ou uma posição de TYPE para recuperar corpo
  e sustain, e desça o TONE do pedal em 1-2 pontos (e o tone da guitarra
  para 7-8) para não ficar estridente. Prefira o captador do braço quando
  o original for humbucker de ponte em solo cantado.
- **Ainda não confirmado na guitarra** — esse ajuste é uma hipótese até o
  usuário testar e dizer se foi longe demais ou de menos.

## 2026-09-28 — a chave é de 3 posições, não de 5

- **Observado**: o preset de Sultans of Swing foi escrito na posição 2
  (ponte + centro) de uma chave de 5 vias, que a guitarra do usuário não
  tem.
- **Ajuste a aplicar no futuro**: só existem ponte, centro e braço. Quando
  o timbre original nasce de uma posição intermediária, use o captador mais
  próximo (o central costuma ser o melhor substituto do ponte+centro) e
  compense o que faltar no TONE do pedal, dizendo no `reasoning` que é uma
  aproximação — nunca escreva a posição que ele não pode selecionar.
