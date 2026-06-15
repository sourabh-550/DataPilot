import { renderMarkdown } from "../utils/markdown";

export default function MessageContent({ content }) {
  const html = renderMarkdown(content);

  return (
    <div
      className="message-prose text-sm text-content-muted leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
