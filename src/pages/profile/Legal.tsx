import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TERMS_CONTENT, PRIVACY_CONTENT, LEGAL_TABS, type LegalTab } from '@/constants/legalContent';

// Parse inline formatting: **bold**, _italic_, _**bold+italic**_
function parseInlineFormatting(text: string): React.ReactNode[] {
  const segments: React.ReactNode[] = [];
  // Match _**...**_, **...**, or _..._
  const regex = /_\*\*(.+?)\*\*_|\*\*(.+?)\*\*|_(.+?)_/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      // Bold + Italic: _**...**_
      segments.push(
        <strong key={keyIndex++} className="font-semibold italic text-foreground">
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      // Bold: **...**
      segments.push(
        <strong key={keyIndex++} className="font-semibold text-foreground">
          {match[2]}
        </strong>
      );
    } else if (match[3] !== undefined) {
      // Italic: _..._
      segments.push(
        <em key={keyIndex++} className="italic">
          {match[3]}
        </em>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  return segments.length > 0 ? segments : [text];
}

// Component to render markdown-like content matching mobile DocumentViewer
function DocumentViewer({ content }: { content: string }) {
  const renderContent = (text: string) => {
    // Split by double newlines to get paragraphs
    const paragraphs = text.split('\n\n');
    const elements: React.ReactNode[] = [];

    paragraphs.forEach((paragraph, index) => {
      const trimmed = paragraph.trim();

      if (!trimmed) {
        return;
      }

      // Main title (# Title) - not ## or ###
      if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
        elements.push(
          <h1
            key={index}
            className="text-xl font-extrabold text-foreground text-center mb-2"
          >
            {trimmed.substring(2)}
          </h1>
        );
        return;
      }

      // Sub-heading (### Sub-heading) - check before ##
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3
            key={index}
            className="text-base font-semibold text-foreground mt-4 mb-2"
          >
            {parseInlineFormatting(trimmed.substring(4))}
          </h3>
        );
        return;
      }

      // Section heading (## Heading)
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2
            key={index}
            className="text-lg font-bold text-kaviBlue mt-6 mb-2"
          >
            {trimmed.substring(3)}
          </h2>
        );
        return;
      }

      // Warning text (!! ... !!)
      if (trimmed.startsWith('!!') && trimmed.endsWith('!!')) {
        elements.push(
          <p
            key={index}
            className="text-sm font-bold text-red-600 leading-5 mb-4 text-center"
          >
            {trimmed.slice(2, -2).trim()}
          </p>
        );
        return;
      }

      // Multi-line block with bullets
      if (trimmed.includes('\n')) {
        const lines = trimmed.split('\n');
        elements.push(
          <div key={index} className="mb-4">
            {lines.map((line, lineIdx) => {
              const l = line.trim();
              if (l.startsWith('• ')) {
                return (
                  <div key={lineIdx} className="flex pl-2 mb-1">
                    <span className="text-sm leading-5 text-foreground mr-2">•</span>
                    <span className="flex-1 text-sm leading-5 text-foreground">
                      {parseInlineFormatting(l.slice(2))}
                    </span>
                  </div>
                );
              }
              return (
                <p key={lineIdx} className="text-sm text-foreground mb-2 leading-5">
                  {parseInlineFormatting(l)}
                </p>
              );
            })}
          </div>
        );
        return;
      }

      // Single bullet line
      if (trimmed.startsWith('• ')) {
        elements.push(
          <div key={index} className="flex pl-2 mb-1">
            <span className="text-sm leading-5 text-foreground mr-2">•</span>
            <span className="flex-1 text-sm leading-5 text-foreground">
              {parseInlineFormatting(trimmed.slice(2))}
            </span>
          </div>
        );
        return;
      }

      // Regular paragraph with inline formatting
      elements.push(
        <p key={index} className="text-sm text-foreground mb-4 leading-5">
          {parseInlineFormatting(trimmed)}
        </p>
      );
    });

    return elements;
  };

  return (
    <div className="prose prose-sm max-w-none">
      {renderContent(content)}
    </div>
  );
}

export function Legal() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as LegalTab) || 'terms';
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const handleTabChange = (tab: LegalTab) => {
    setActiveTab(tab);
  };

  const getTabTitle = (tab: LegalTab): string => {
    switch (tab) {
      case 'terms':
        return 'Terms & Conditions';
      case 'privacy':
        return 'Privacy Policy';
      default:
        return 'Legal';
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{getTabTitle(activeTab)}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6">
        {LEGAL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl p-6 overflow-auto max-h-[calc(100vh-250px)]">
        <DocumentViewer content={activeTab === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT} />
      </div>
    </div>
  );
}

export default Legal;
