import { OpenAPIRoute, Query } from '@cloudflare/itty-router-openapi';
import { DateTime } from 'luxon';
import { Env } from '../worker-configuration';

export class GetTime extends OpenAPIRoute {
  static schema = {
    tags: ['Time'],
    summary: 'Get current time in a specific format and timezone',
    parameters: {
      format: Query(String, {
        description:
          'The format to return the current time in. A custom format string that follows the token-based formatting conventions provided by the Luxon library.',
        default: 'iso8601',
        required: false,
      }),
      tz: Query(String, {
        description:
          "The timezone to return the current time in. If the user not provide a timezone, you should try asking for the user's timezone. Unless the user provides a timezone, you should not pass this param. If the timezone is not provided, follow the further instructions in the response errmsg.",
        default: '',
        required: false,
      }),
    },
    responses: {
      '200': {
        schema: {
          now: '2023-07-27T08:30:00.000+08:00',
          format: 'iso8601',
          tz: 'UTC',
          errmsg: `Invalid timezone: "Americann/newyork". The response is defaulting to: "UTC". Please attempt to determine the appropriate timezone using the user's ISO code: "US-NY" and then return the correct local time.`,
        },
      },
    },
  };

  async handle(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    data: Record<string, any>,
  ): Promise<{ now: string | null; format: string; tz: string; errmsg: string }> {
    const isoCode = request.headers.get('openai-subdivision-1-iso-code');
    const cfTz: string = request.cf?.timezone;
    const { searchParams } = new URL(request.url);

    const { tz, errmsg: tzErrmsg } = this.determineTimezone(searchParams.get('tz'), isoCode, cfTz);
    const { formatted_now, format, errmsg: formatErrmsg } = this.formatTime(searchParams.get('format'), tz);

    return {
      now: formatted_now,
      format: format,
      tz: tz,
      errmsg: `${tzErrmsg} ${formatErrmsg}`.trim(),
    };
  }

  private determineTimezone(tzParam: string | null, isoCode: string | null, cfTz: string | null): { tz: string; errmsg: string } {
    if (tzParam) {
      const dt = DateTime.now().setZone(tzParam);
      if (dt.isValid) return { tz: tzParam, errmsg: '' };

      return { tz: 'UTC', errmsg: `Invalid timezone: "${tzParam}".` };
    }

    if (isoCode) {
      return {
        tz: 'UTC',
        errmsg: `The response is defaulting to: "UTC". Please attempt to determine the appropriate timezone using the user's ISO code: "${isoCode}" and then return the correct local time.`,
      };
    }

    if (cfTz) {
      return {
        tz: cfTz,
        errmsg: `Using the user's Cloudflare timezone: "${cfTz}".`,
      };
    }

    return { tz: 'UTC', errmsg: 'The response is defaulting to: "UTC".' };
  }

  private formatTime(formatParam: string | null, tz: string): { formatted_now: string | null; format: string; errmsg: string } {
    const now = DateTime.now().setZone(tz);
    let format = formatParam || 'iso8601';
    let formatted_now;

    try {
      switch (format) {
        case 'iso8601':
          formatted_now = now.toISO();
          break;
        default:
          formatted_now = now.toFormat(format);
      }
      return { formatted_now, format, errmsg: '' };
    } catch (error) {
      return {
        formatted_now: now.toISO(),
        format: 'iso8601',
        errmsg: `Invalid format: "${format}", the response is defaulting to: "iso8601".`,
      };
    }
  }
}
