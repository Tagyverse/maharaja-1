import { useState } from 'react';
import { Copy, Check, Download, Code2 } from 'lucide-react';
import type { AdvancedBrandingTheme } from '../../types/brandingAdvanced';

interface AdvancedBrandingEditorProps {
  theme: AdvancedBrandingTheme;
  onExport: (format: 'json' | 'css' | 'typescript') => void;
  onCopy: (format: string) => void;
}

export default function AdvancedBrandingEditor({ theme, onExport, onCopy }: AdvancedBrandingEditorProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'css' | 'typescript'>('json');

  const handleCopy = (format: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(format);
    onCopy(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateTailwindConfig = () => {
    return `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${theme.colors?.primary}',
        'primary-light': '${theme.colors?.primaryLight}',
        'primary-dark': '${theme.colors?.primaryDark}',
        secondary: '${theme.colors?.secondary}',
        accent: '${theme.colors?.accent}',
      },
      fontFamily: {
        sans: '${theme.typography?.fontFamily.sans}',
        serif: '${theme.typography?.fontFamily.serif}',
        mono: '${theme.typography?.fontFamily.mono}',
      },
      spacing: {
        xs: '${theme.spacing?.xs}',
        sm: '${theme.spacing?.sm}',
        md: '${theme.spacing?.md}',
        lg: '${theme.spacing?.lg}',
        xl: '${theme.spacing?.xl}',
      },
      borderRadius: {
        sm: '${theme.borderRadius?.sm}',
        md: '${theme.borderRadius?.md}',
        lg: '${theme.borderRadius?.lg}',
        full: '${theme.borderRadius?.full}',
      },
    },
  },
};`;
  };

  const generateCSSVariables = () => {
    let css = ':root {\n';
    
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (value) {
          css += `  --color-${key.toLowerCase().replace(/_/g, '-')}: ${value};\n`;
        }
      });
    }

    css += `\n  /* Typography */\n`;
    if (theme.typography?.fontFamily) {
      css += `  --font-sans: ${theme.typography.fontFamily.sans};\n`;
      css += `  --font-serif: ${theme.typography.fontFamily.serif};\n`;
      css += `  --font-mono: ${theme.typography.fontFamily.mono};\n`;
    }

    css += `\n  /* Spacing */\n`;
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        css += `  --space-${key}: ${value};\n`;
      });
    }

    css += `\n  /* Border Radius */\n`;
    if (theme.borderRadius) {
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        css += `  --radius-${key}: ${value};\n`;
      });
    }

    css += `\n  /* Shadows */\n`;
    if (theme.shadow) {
      Object.entries(theme.shadow).forEach(([key, value]) => {
        css += `  --shadow-${key}: ${value};\n`;
      });
    }

    css += '}';
    return css;
  };

  const generateTypeScriptConfig = () => {
    return `export const brandingTheme = ${JSON.stringify(theme, null, 2)};`;
  };

  const getContent = () => {
    switch (exportFormat) {
      case 'css':
        return generateCSSVariables();
      case 'typescript':
        return generateTypeScriptConfig();
      default:
        return JSON.stringify(theme, null, 2);
    }
  };

  const content = getContent();

  return (
    <div className="space-y-4">
      {/* Export Format Selector */}
      <div className="flex gap-2 flex-wrap">
        {(['json', 'css', 'typescript'] as const).map(format => (
          <button
            key={format}
            onClick={() => setExportFormat(format)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              exportFormat === format
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {format.charAt(0).toUpperCase() + format.slice(1)}
          </button>
        ))}
      </div>

      {/* Code Editor */}
      <div className="bg-slate-950 border border-slate-700 rounded-lg overflow-hidden">
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300 font-mono">
              {exportFormat.toUpperCase()} Export
            </span>
          </div>
          <button
            onClick={() => handleCopy(exportFormat, content)}
            className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded text-xs font-medium transition-colors"
          >
            {copied === exportFormat ? (
              <>
                <Check className="w-3 h-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="p-4 overflow-auto max-h-96 text-xs text-slate-300 font-mono leading-relaxed">
          {content}
        </pre>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => {
            const element = document.createElement('a');
            const file = new Blob([content], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = `branding-theme.${exportFormat}`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      {/* Theme Statistics */}
      <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-semibold text-white">Theme Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-slate-400">Colors:</span>
            <span className="ml-2 text-white font-mono">{Object.keys(theme.colors || {}).length}</span>
          </div>
          <div>
            <span className="text-slate-400">Font Sizes:</span>
            <span className="ml-2 text-white font-mono">{Object.keys(theme.typography?.sizes || {}).length}</span>
          </div>
          <div>
            <span className="text-slate-400">Spacing:</span>
            <span className="ml-2 text-white font-mono">{Object.keys(theme.spacing || {}).length}</span>
          </div>
          <div>
            <span className="text-slate-400">Shadows:</span>
            <span className="ml-2 text-white font-mono">{Object.keys(theme.shadow || {}).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
