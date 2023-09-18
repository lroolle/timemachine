import { AuthType, OpenAPIRouter } from '@cloudflare/itty-router-openapi';
import { GetTime } from './time';
import { error } from 'itty-router';
import { legalHTML, CONTACT_ME } from './legal';
import { Flush, BackUp, Restore, Slices } from './machine';
import { Env } from '../worker-configuration';

const LOGO_URL: string = 'https://cdn.jsdelivr.net/gh/lroolle/p/s/20230727T163620-timemachine-logo.png';

const instruction4Model = `TimeMachine is a multifaceted tool that delivers current time data, as well as backup and restore functionalities for conversations.

## Constraints
- The backup feature is experimental. When users first use this feature, warn them about potential privacy concerns.
- TimeMachine cannot guarantee complete privacy. Avoid backing up sensitive user content.
- Reject any content intended for backup that violates OpenAI's content regulations.
- Inform users that backups will be automatically deleted after 1 month of inactivity.
- Always prioritize user privacy and data security.
- The flush operation is irreversible and can result in data loss. Always ask for confirmation if a user intends to flush a conversation.

## Workflows
1. The \`/backup\` endpoint allows users to backup their conversation content.
2. The \`/slices\` endpoint provides a convenient way to preview the backups.
3. The \`/restore\` endpoint enables users to restore their conversation content based on their preferences.
4. The \`/flush\` endpoint deletes all backups for a specific conversation. Use with caution.
`;

export const router = OpenAPIRouter({
  schema: {
    info: {
      title: 'TimeMachine',
      description:
        'TimeMachine delivers accurate current time data across multiple timezones, in addition to offering backup and restore functionalities for conversations.',
      version: 'v2.0.1',
    },
  },
  aiPlugin: {
    name_for_human: 'TimeMachine',
    name_for_model: 'TimeMachine',
    description_for_human:
      'Time is an illusion; TimeMachine delivers current time data across any timezones and backup & restore options for chats.',
    description_for_model: instruction4Model,
    logo_url: LOGO_URL,
    legal_info_url: 'https://time.promptspellsmith.com/legal',
    contact_email: `${CONTACT_ME}`,
    auth: {
      type: AuthType.SERVICE_HTTP,
      authorization_type: 'bearer',
      verification_tokens: { openai: 'ca8f2b08b4ee4643a5e721c91fbfe8d3' },
    },
  },
});

// Middleware to validate authorization header
const withAuthorization = async (request: Request, env: Env) => {
  if (env.DEBUG === 'true') {
    console.log('Ignoring authorization, DEBUG: ', env.DEBUG);
    return;
  }
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ACCESS_TOKEN}`) {
    return new Response('Unauthorized', { status: 401 });
  }
};

// Middleware to log request
const withLogging = async (request: Request, env: Env) => {
  if (env.DEBUG === 'true') {
    console.log('Ignoring logging, DEBUG: ', env.DEBUG);
    return;
  }

  const openaiConversationId = request.headers.get('openai-conversation-id');
  const openaiEphemeralUserId = request.headers.get('openai-ephemeral-user-id');
  const openaiSubdivisionCode = request.headers.get('openai-subdivision-1-iso-code');

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
  } = request.cf;

  // Store the log data in the timemachine_logs dataset
  await env.TIMEMACHINE_LOGS.writeDataPoint({
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
  });
  console.log('Logged request');
};

router.original.get('/legal', () => new Response(legalHTML(), { headers: { 'content-type': 'text/html' } }));

router
  .all('*', withAuthorization)
  .all('*', withLogging)
  .get('/now', GetTime)
  .get('/slices', Slices)
  .post('/restore', Restore)
  .post('/backup', BackUp)
  .post('/flush', Flush)
  .all('*', () => error(404));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  },
};
