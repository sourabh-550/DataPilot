import { renderMarkdown } from "../utils/markdown";

// Renders assistant text with light markdown (**bold**, `code`, lists).
// renderMarkdown escapes HTML first, so model output can't inject markup.
export default function MessageContent({ content }) {
  const html = renderMarkdown(content);

  return <div className="message-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
