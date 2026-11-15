import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function ArticleContent({ content }: { content: string }) {
  const blocks = content
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);
  return (
    <div className="prose-copy mt-8 space-y-5 text-base leading-8 text-foreground">
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        if (lines.every((line) => /^-\s+/.test(line))) {
          return (
            <ul key={index} className="list-disc space-y-2 pl-6">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{inline(line.replace(/^-\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        const heading = /^(#{2,3})\s+(.+)$/.exec(block);
        if (heading) {
          const Heading = heading[1]?.length === 2 ? "h2" : "h3";
          return (
            <Heading key={index} className="font-display text-2xl font-bold leading-tight">
              {inline(heading[2] ?? "")}
            </Heading>
          );
        }
        if (block.startsWith("> ")) {
          return (
            <blockquote
              key={index}
              className="border-l-2 border-primary pl-4 italic text-muted-foreground"
            >
              {inline(block.replace(/^>\s?/gm, ""))}
            </blockquote>
          );
        }
        return (
          <p key={index}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {inline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
