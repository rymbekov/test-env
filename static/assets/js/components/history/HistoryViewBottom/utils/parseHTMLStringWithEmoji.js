import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Emoji } from '@picsio/ui';

export const renderEmojiToString = (emojiName) => ReactDOMServer.renderToString(<Emoji name={emojiName} />);

function parseHTMLStringWithEmoji(htmlString) {
  const parsed = htmlString && htmlString.replace(/<img .*?>/g, (matched) => {
    const emojiName = /data-stringify="(:[\w\d\s/(/)+-]*:)"/.exec(matched)[1];

    return emojiName;
  });

  return parsed;
}

export default parseHTMLStringWithEmoji;
