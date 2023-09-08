import * as Sentry from '@sentry/react';

import {simpleMarkup} from 'sentry/views/starfish/utils/sqlish/formatters/simpleMarkup';
import {string} from 'sentry/views/starfish/utils/sqlish/formatters/string';
import {SQLishParser} from 'sentry/views/starfish/utils/sqlish/SQLishParser';

enum Format {
  STRING = 'string',
  SIMPLE_MARKUP = 'simpleMarkup',
}

const FORMATTERS = {
  [Format.STRING]: string,
  [Format.SIMPLE_MARKUP]: simpleMarkup,
};

export class SQLishFormatter {
  parser: SQLishParser;

  constructor() {
    this.parser = new SQLishParser();
  }

  toString(sql: string) {
    return this.toFormat(sql, Format.STRING);
  }

  toSimpleMarkup(sql: string) {
    return this.toFormat(sql, Format.SIMPLE_MARKUP);
  }

  toFormat(sql: string, format: Format.STRING): string;
  toFormat(sql: string, format: Format.SIMPLE_MARKUP): React.ReactElement[];
  toFormat(sql: string, format: Format) {
    let tokens;

    const sentryTransaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const sentrySpan = sentryTransaction?.startChild({
      op: 'function',
      description: 'SQLishFormatter.toFormat',
      data: {
        format,
      },
    });

    try {
      tokens = this.parser.parse(sql);
    } catch (error) {
      Sentry.withScope(scope => {
        scope.setFingerprint(['sqlish-parse-error']);
        // Get the last 100 characters of the error message
        scope.setExtra('message', error.message?.slice(-100));
        scope.setExtra('found', error.found);
        Sentry.captureException(error);
      });
      // If we fail to parse the SQL, return the original string
      return sql;
    }

    const formattedString = FORMATTERS[format](tokens);
    sentrySpan?.finish();

    return formattedString;
  }
}
