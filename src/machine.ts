import { OpenAPIRoute } from '@cloudflare/itty-router-openapi'

async function saveMessages(key: string, value: any) {
  // TODO
  console.log('Saving messages, key: ', key)
}

// Backup a conversation to the KV store
export class BackUp extends OpenAPIRoute {
  static schema = {
    tags: ['Backup'],
    summary: 'Backup a conversation to the KV store',
    requestBody: {
      description: 'Conversation data to be backed up.',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              conversation_id: {
                type: 'string',
                description:
                  'The unique identifier of the conversation to be backed up.',
              },
              messages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    role: {
                      type: 'string',
                      enum: ['user', 'assistant'],
                      description: 'Role of the message sender.',
                    },
                    content: {
                      type: 'string',
                      description: 'Content of the message.',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Successfully backed up the conversation.',
        content: {
          'application/json': {
            schema: {
              message: 'Ok.',
            },
          },
        },
      },
    },
  }

  async handle(request: Request, env, ctx, data: Record<string, any>) {
    try {
      const { conversation_id, messages } = await request.json()

      await saveMessages(conversation_id, messages)

      return new Response(
        JSON.stringify({
          message: 'Ok.',
        }),
        { status: 200 }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({
          message: 'Internal Server Error.',
        }),
        { status: 500 }
      )
    }
  }
}

// Backup slice of a conversation
export class BackUpSlice extends OpenAPIRoute {
  // TODO
}

// Restore a conversation
export class Restore extends OpenAPIRoute {
  // TODO
}
