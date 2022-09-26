import express from 'express'
import cors from 'cors'

import { PrismaClient } from '@prisma/client'

import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes'
import { convertHourMinutesToString } from './utils/convert-hour-minutes-to-string'

const app = express()

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient({
  log: ['query']
});

app.get('/games', async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        }
      }
    }
  })

  return res.json(games);
})

app.post('/games/:id/ads', async (req, res) => {
  const gameId = req.params.id;
  const body : any = req.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      weekDays: body.weekDays.join(','),
      useVoiceChannel: body.useVoiceChannel,
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      discord: body.discord,
    }
  })
  return res.status(201).json(ad);
})

app.get('/games/:id/ads', async (req, res) => {

  const gameId = req.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: 'asc',
    }
  })

  return res.json(ads.map(ad => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertHourMinutesToString(ad.hourStart),
      hourEnd: convertHourMinutesToString(ad.hourEnd),
    }
  }))
})

app.get('/ads/:id/discord', async (req, res) => {

  const adId = req.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    }
  })

  return res.json({
    discord: ad.discord,
  })
})

app.listen(3333)


// Query: Utilizado com o ? para presistir estados (datas, filtros, ordem dos itens)
//        não utilizar para informações sensiveis
//        http://localhost:333/ads?page=2&order=last&filter=open
//        sempre são nomeados
// Route: tbm são parametros da url mas eles não são nomeados
//        http://localhost:333/ads/5
//        pode ser um slug por exemplo, um identificador
// Body:  para quando vamos enviar varias informações em uma unica requisição, geralmente em envio de formulario.
//        não fica na url, fica escondido e pode ser utilizado para transmitir informações sensiveis