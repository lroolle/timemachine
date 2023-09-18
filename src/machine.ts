import { OpenAPIRoute, Str, Query } from '@cloudflare/itty-router-openapi';
import { Env } from '../worker-configuration';
import { previewContent, matchTimestamp } from './utils';

const MAX_CONVERSATION_ENTRIES_DEFAULT = 10;
const ONE_MONTH_IN_SECONDS = 30 * 24 * 60 * 60;
const CONVERSATION_TTL_DEFAULT = ONE_MONTH_IN_SECONDS;

type ConversationEntry = {
  // iso string, easily readable for the model
  timestamp: Date;
  // A set of keywords or key points for referencing or searching the backup content.  summary: string;
  index: string;
  // raw content
  content: string;
};

type ConversationBackup = ConversationEntry[];

type SaveStatus = {
  success: boolean;
  message: string;
};

async function getConversation(env: Env, conversationId: string): Promise<ConversationBackup | null> {
  try {
    // Retrieve the stringified data from the cache
    const rawData: string | null = await env.TIMEMACHINE_KV.get(conversationId);

    if (rawData) {
      // Parse the stringified data into the ConversationBackup type
      const parsedData: ConversationEntry[] = JSON.parse(rawData).map((entry: any) => ({
        timestamp: new Date(entry.timestamp),
        index: entry.index,
        content: entry.content,
      }));
      return parsedData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
}

async function saveConversation(env: Env, conversationId: string, index: string, content: string): Promise<SaveStatus> {
  try {
    // Retrieve existing conversation backup from the cache
    const existingBackup: ConversationBackup | null = await getConversation(env, conversationId);

    const newEntry: ConversationEntry = {
      index: index,
      content: content,
      timestamp: new Date(),
    };

    let updatedBackup: ConversationBackup;

    // TODO: we may implement a more sophisticated backup strategy in the future
    //   for example content dedup
    if (existingBackup) {
      updatedBackup = [...existingBackup, newEntry];

      const maxEntries: number = env.MAX_CONVERSATION_ENTRIES || MAX_CONVERSATION_ENTRIES_DEFAULT;
      while (updatedBackup.length > maxEntries) {
        updatedBackup.shift();
      }
    } else {
      updatedBackup = [newEntry];
    }

    await env.TIMEMACHINE_KV.put(conversationId, JSON.stringify(updatedBackup), { expirationTtl: CONVERSATION_TTL_DEFAULT });
    console.log('Conversation entry added:', conversationId);
    return {
      success: true,
      message: `Backup ID: ${conversationId}. Please save this for reference.`,
    };
  } catch (error) {
    console.error('Error saving conversation entry:', error);
    return {
      success: false,
      message: `Error saving conversation: ${error.message || 'Unknown error'}`,
    };
  }
}

// Backup a conversation to the KV store
export class BackUp extends OpenAPIRoute {
  static schema = {
    tags: ['BackupMachine'],
    summary: 'User can backup current conversation content to remote store.',
    requestBody: {
      content: new Str({
        required: false,
        description: 'Conversation text content to backup.',
      }),
      index: new Str({
        required: true,
        description: 'A set of keywords or key points for referencing or searching the backup content.',
      }),
    },
    responses: {
      '200': {
        schema: {
          message: 'Ok.',
        },
      },
    },
  };

  async handle(request: Request, env: Env, _ctx: ExecutionContext, data: Record<string, any>) {
    try {
      const conversationId: string = request.headers.get('openai-conversation-id') || '';
      if (!conversationId || conversationId.length === 0) {
        return new Response(
          JSON.stringify({
            message: 'Missing conversation id, abort.',
          }),
          { status: 400 },
        );
      }

      const index = data.body.index;
      const content = data.body.content;
      const status: SaveStatus = await saveConversation(env, conversationId, index, content);

      return new Response(JSON.stringify(status), { status: status.success ? 200 : 500 });
    } catch (error) {
      console.error('Save conversation error: ', error);
      return new Response(JSON.stringify({ message: 'Internal Server Error.' }), { status: 500 });
    }
  }
}

export class Slices extends OpenAPIRoute {
  static schema = {
    tags: ['BackupMachine'],
    summary: 'Retrieve and preview backup slices of conversations by conversationIds.',
    parameters: {
      conversationIds: Query(String, {
        description: 'Comma-separated list of conversation IDs to retrieve. If not provided, it defaults to the current conversationId.',
        default: '',
        required: false,
      }),
    },
    responses: {
      '200': {
        description: 'Successful Response.',
        schema: {
          slices: [
            {
              conversationId: 'c745e173-d3e3-4f67-85ef-cc8e68db6478',
              index: 'example',
              contentPreview: 'A short preview ... content.',
              timestamp: '2023-09-18T04:05:28.321Z',
            },
          ],
        },
      },
    },
  };

  async handle(request: Request, env: Env, ctx: ExecutionContext, data: Record<string, any>) {
    try {
      let conversationIdsString = data.conversationIds || request.headers.get('openai-conversation-id') || '';
      let conversationIds = conversationIdsString.split(',');

      if (!conversationIds || conversationIds.length === 0) {
        return new Response(
          JSON.stringify({
            message: 'Missing conversation ids, abort.',
          }),
          { status: 400 },
        );
      }

      const backups = [];

      for (const conversationId of conversationIds) {
        const backupEntries = await getConversation(env, conversationId.trim());
        if (backupEntries && backupEntries.length > 0) {
          for (const entry of backupEntries) {
            backups.push({
              conversationId: conversationId,
              timestamp: entry.timestamp.toISOString(),
              index: entry.index,
              contentPreview: previewContent(entry.content),
            });
          }
        }
      }

      return new Response(JSON.stringify({ slices: backups }), { status: 200 });
    } catch (error) {
      return new Response(
        JSON.stringify({
          message: 'Internal Server Error.',
        }),
        { status: 500 },
      );
    }
  }
}

export class Restore extends OpenAPIRoute {
  static schema = {
    tags: ['BackupMachine'],
    summary: 'Restore a conversation from backups to a specific point in time.',
    requestBody: {
      timestamp: new Str({
        required: false,
        description: 'Timestamp or pattern to match backup entries. Defaults to the latest backup if not provided.',
      }),
      conversationId: new Str({
        required: false,
        description: 'ID of the conversation to restore. Defaults to the current conversation if not provided.',
      }),
    },
    responses: {
      '200': {
        description: 'Successful Response.',
        schema: {
          content: 'merged content from the conversation backups',
        },
      },
    },
  };

  async handle(request: Request, env: Env, _ctx: ExecutionContext, data: Record<string, any>) {
    try {
      const conversationId = data.body.conversationId || request.headers.get('openai-conversation-id');
      const timestamp = data.body.timestamp;

      const backupEntries = await getConversation(env, conversationId);
      if (!backupEntries || backupEntries.length === 0) {
        return new Response(JSON.stringify({ content: '' }), { status: 200 });
      }

      const matchedEntries = [];
      if (timestamp) {
        for (let i = backupEntries.length - 1; i >= 0; i--) {
          if (matchTimestamp(backupEntries[i].timestamp.toISOString(), timestamp)) {
            matchedEntries.push(backupEntries[i]);
          }
        }
      } else {
        matchedEntries.push(backupEntries[backupEntries.length - 1]);
      }

      const mergedContent = matchedEntries.map((entry) => entry.content).join('\n\n');

      return new Response(JSON.stringify({ content: mergedContent }), { status: 200 });
    } catch (error) {
      console.error('Restore error: ', error);
      return new Response(JSON.stringify({ content: '' }), { status: 200 });
    }
  }
}

export class Flush extends OpenAPIRoute {
  static schema = {
    tags: ['BackupMachine'],
    summary: 'Flush the conversation backups.',
    requestBody: {},
    responses: {
      '200': {
        description: 'Successful Response.',
        schema: {
          message: 'Ok.',
        },
      },
    },
  };

  async handle(request: Request, env: Env, _ctx: ExecutionContext, data: Record<string, any>) {
    let conversationId;
    try {
      conversationId = request.headers.get('openai-conversation-id') || '';
      if (conversationId && conversationId.length > 0) {
        await env.TIMEMACHINE_KV.delete(conversationId);
        console.log(`Flushed conversation: ${conversationId}`);

        return new Response(JSON.stringify({ message: 'Ok.' }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ message: 'No openai-conversation-id found, ignore.' }), { status: 200 });
      }
    } catch (error) {
      console.error(`Flush conversation: ${conversationId}, error: ${error}`);
      return new Response(JSON.stringify({ message: 'Internal Server Error.' }), { status: 500 });
    }
  }
}
