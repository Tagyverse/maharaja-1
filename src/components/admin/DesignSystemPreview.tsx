import type { AdvancedBrandingTheme } from '../../types/brandingAdvanced';

interface DesignSystemPreviewProps {
  theme: AdvancedBrandingTheme;
  compact?: boolean;
}

export default function DesignSystemPreview({ theme, compact = false }: DesignSystemPreviewProps) {
  const primaryColor = theme.colors?.primary || '#1F2937';
  const textColor = theme.colors?.neutral900 || '#000000';
  const neutral100 = theme.colors?.neutral100 || '#F3F4F6';

  return (
    <div className="space-y-6">
      {/* Color System */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">Color System</h4>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {theme.colors && Object.entries(theme.colors).slice(0, compact ? 4 : 10).map(([name, color]) => (
            color && (
              <div key={name} className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-lg border border-slate-600 mb-1.5"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-slate-400 text-center truncate">{name}</span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">Typography</h4>
        <div className="space-y-2">
          <div style={{ fontSize: theme.typography?.sizes['3xl'].size, fontFamily: theme.typography?.fontFamily.sans }} className="text-white font-bold">
            Heading 3XL
          </div>
          <div style={{ fontSize: theme.typography?.sizes['xl'].size, fontFamily: theme.typography?.fontFamily.sans }} className="text-white font-semibold">
            Heading XL
          </div>
          <div style={{ fontSize: theme.typography?.sizes['base'].size, fontFamily: theme.typography?.fontFamily.sans }} className="text-slate-300">
            Body text in regular weight for comfortable reading
          </div>
        </div>
      </div>

      {/* Components */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">Components</h4>
        <div className="space-y-3">
          {/* Buttons */}
          <div className="flex gap-2">
            <button
              style={{
                backgroundColor: primaryColor,
                padding: '10px 16px',
                borderRadius: theme.borderRadius?.md || '8px',
              }}
              className="text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Primary Button
            </button>
            <button
              style={{
                border: `2px solid ${primaryColor}`,
                color: primaryColor,
                padding: '10px 16px',
                borderRadius: theme.borderRadius?.md || '8px',
              }}
              className="text-sm font-semibold hover:bg-opacity-10 transition-colors"
            >
              Outline Button
            </button>
          </div>

          {/* Card */}
          <div
            style={{
              backgroundColor: neutral100,
              padding: theme.spacing?.md || '16px',
              borderRadius: theme.borderRadius?.lg || '12px',
            }}
            className="border border-slate-300"
          >
            <div
              style={{
                color: textColor,
                fontSize: theme.typography?.sizes['lg'].size || '18px',
              }}
              className="font-semibold mb-1"
            >
              Card Title
            </div>
            <div
              style={{
                color: theme.colors?.neutral600 || '#666',
                fontSize: theme.typography?.sizes['sm'].size || '14px',
              }}
            >
              This is a preview card with the applied typography and spacing system.
            </div>
          </div>

          {/* Badge */}
          <div className="flex gap-2">
            <span
              style={{
                backgroundColor: primaryColor,
                color: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: theme.borderRadius?.full || '9999px',
                fontSize: theme.typography?.sizes['xs'].size || '12px',
              }}
              className="font-medium"
            >
              Primary Badge
            </span>
            <span
              style={{
                backgroundColor: theme.colors?.accent || '#06B6D4',
                color: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: theme.borderRadius?.full || '9999px',
                fontSize: theme.typography?.sizes['xs'].size || '12px',
              }}
              className="font-medium"
            >
              Accent Badge
            </span>
          </div>
        </div>
      </div>

      {/* Border Radius Examples */}
      {!compact && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Border Radius</h4>
          <div className="flex gap-2 flex-wrap">
            {theme.borderRadius && Object.entries(theme.borderRadius).map(([name, value]) => (
              value && (
                <div
                  key={name}
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: primaryColor,
                    borderRadius: value,
                  }}
                  className="flex items-center justify-center"
                  title={`${name}: ${value}`}
                />
              )
            ))}
          </div>
        </div>
      )}

      {/* Shadow System */}
      {!compact && theme.shadow && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Shadows</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(theme.shadow).map(([name, shadowValue]) => (
              shadowValue && shadowValue !== 'none' && (
                <div
                  key={name}
                  className="p-4 bg-white rounded-lg"
                  style={{ boxShadow: shadowValue }}
                >
                  <span className="text-xs text-gray-600 font-medium">{name}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
