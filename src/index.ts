import { AuthType, OpenAPIRouter } from '@cloudflare/itty-router-openapi'
import { GetTime } from './time'
import { error } from 'itty-router'
import { legalHTML, CONTACT_ME } from './legal'

export interface Env {
  ACCESS_TOKEN: string
}

const LOGO_URL: string =
  'https://cdn.jsdelivr.net/gh/lroolle/p/s/20230727T163620-timemachine-logo.png'

export const router = OpenAPIRouter({
  schema: {
    info: {
      title: 'TimeMachine',
      description:
        'TimeMachine is a versatile plugin for ChatGPT that provides real-time data, accommodating multiple time formats and timezones. It offers users the flexibility to choose their desired format and timezone, making time-related tasks seamless and intuitive.',
      version: 'v1.3.0',
    },
  },
  aiPlugin: {
    name_for_human: 'TimeMachine',
    name_for_model: 'TimeMachine',
    description_for_human:
      'Time is an illusion, especially for ChatGPT. With TimeMachine, you can travel through different timezones and formats.',
    description_for_model:
      'TimeMachine is a tool that provides current time data in various formats and timezones. It integrates with ChatGPT to offer users real-time information based on their preferences.',
    logo_url: LOGO_URL,
    legal_info_url: 'https://time.promptspellsmith.com/legal',
    contact_email: `${CONTACT_ME}`,
    auth: {
      type: AuthType.SERVICE_HTTP,
      authorization_type: 'bearer',
      verification_tokens: { openai: '472e5541fddb4dd685490f86db7c0217' },
    },
  },
})

// Middleware to validate authorization header
const withAuthorization = (request, env) => {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || authHeader !== `Bearer ${env.ACCESS_TOKEN}`) {
    return new Response('Unauthorized', { status: 401 })
  }
}

// Middleware to log request
const withLogging = async (request, env) => {
  const openaiConversationId = request.headers.get('openai-conversation-id')
  const openaiEphemeralUserId = request.headers.get('openai-ephemeral-user-id')
  const openaiSubdivisionCode = request.headers.get(
    'openai-subdivision-1-iso-code',
  )

  // Extract properties from request.cf
  const {
    asn,
    asOrganization,
    colo,
    country,
    isEUCountry,
    city,
    continent,
    latitude,
    longitude,
    postalCode,
    metroCode,
    region,
    regionCode,
    timezone,
  } = request.cf

  // Store the log data in the timemachine_logs dataset
  await env.timemachine_logs.writeDataPoint({
    blobs: [
      openaiConversationId,
      openaiEphemeralUserId,
      openaiSubdivisionCode,
      timezone,
      country,
      city,
      region,
      regionCode,
      asOrganization,
      colo,
      isEUCountry,
      continent,
    ],
    doubles: [asn, latitude, longitude, metroCode, postalCode],
    indexes: [],
  })
  console.log('Logged request')
}

router.original.get(
  '/legal',
  () => new Response(legalHTML(), { headers: { 'content-type': 'text/html' } }),
)

router
  .all('*', withAuthorization)
  .all('*', withLogging)
  .get('/now', GetTime)
  .all('*', () => error(404)) // 404 for all else

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return router.handle(request, env, ctx)
  },
}
