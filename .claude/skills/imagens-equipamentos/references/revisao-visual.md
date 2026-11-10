# Revisão visual — feita por uma pessoa

Abra `tmp/imagens/revisao.html`. Para cada equipamento, olhe os candidatos
em tamanho grande (clique na miniatura) e reprove qualquer foto que tenha:

1. **Pessoa** — rosto, mão, braço, silhueta, reflexo, pessoa em
   videochamada na tela.
2. **Marca ou logo legível** — maçã, nome do fabricante na tampa, no
   teclado, na moldura do monitor, na lente ou no cabo.
3. **Texto** — teclas com letras legíveis, etiqueta, embalagem, papel,
   placa, marca d'água.
4. **Tela com conteúdo** — site, sistema, foto, código, área de trabalho.
   Tela apagada ou de uma cor só pode.
5. **Não é o equipamento** — a foto precisa mostrar o item da linha
   (um cabo HDMI é um cabo HDMI, não um adaptador).

Na dúvida, reprove. Foto reprovada não volta como candidata.

## Como registrar

No manifesto `prisma/data/imagens.json`, no item do patrimônio:

- Aprovou: preencha `pixabayId` com o id do candidato e
  `revisao` com `status: "aprovada"`, seu nome em `revisor` e a data.
- Reprovou: acrescente em `rejeitadas` `{ "pixabayId": ..., "motivo": "pessoa" }`
  (motivos: `pessoa`, `marca`, `texto`, `tela`, `nao-e-o-item`, `outro`).
- Nenhum candidato serviu: rode `buscar` de novo (ele traz os próximos).
  Se o termo continuar falhando, o agente propõe um termo novo; se você
  aprovar, preencha `buscaUsada` e `motivoTrocaBusca`. Isso vai para o
  ENTREGA.md.

## Quando nenhuma foto passa

Monitores, webcams e câmeras quase sempre aparecem no Pixabay com marca
legível (Apple, Dell, Canon...). Depois de quatro termos sem foto aprovada,
vale aceitar ilustração ou renderização 3D do próprio Pixabay: preencha
`tipoImagem` (`"illustration"` ou `"all"`) e diga em `motivoTrocaBusca`
quantas fotos foram reprovadas e por quê. Os mesmos cinco critérios valem.

## Quem revisa

O revisor fica registrado em `revisao.revisor`. A revisão pode ser
delegada ao agente, mas só por decisão explícita da pessoa responsável
pela entrega, e o revisor fica registrado como "agente ... (revisão
delegada pelo usuário)". O código não distingue: a garantia continua sendo
que nada sem revisor registrado é preparado.

O número de fotos reprovadas e os motivos são lidos do manifesto para a
seção 4 do ENTREGA.md.
