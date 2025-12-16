import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SudoSecureDataView - Displays sensitive card data using Sudo Africa's Secure Proxy
 *
 * This component uses an iframe to load Sudo's SecureProxy.js library, which is the
 * only officially supported way to display sensitive card data from Sudo Africa.
 *
 * This approach maintains PCI compliance by ensuring sensitive data never passes
 * through your app code - it's handled entirely within the secure iframe.
 */

interface SudoSecureDataViewProps {
  /** The provider card ID (providerCardId from Sudo) */
  cardId: string;
  /** The card token for authorization */
  cardToken: string;
  /** The type of data to display */
  dataType: 'number' | 'cvv2' | 'defaultPin';
  /** Custom text style (CSS string) */
  textStyle?: string;
  /** Placeholder text while loading */
  placeholder?: string;
  /** Additional class names */
  className?: string;
}

export function SudoSecureDataView({
  cardId,
  cardToken,
  dataType,
  textStyle,
  placeholder = '••••',
  className,
}: SudoSecureDataViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine environment (check if we're on test/sandbox domain)
  const isDev = import.meta.env.DEV || window.location.hostname.includes('test') || window.location.hostname.includes('localhost');
  const vaultId = isDev ? 'we0dsa28s' : 'vdl2xefo5';
  const scriptUrl = 'https://js.securepro.xyz/sudo-show/1.1/ACiWvWF9tYAez4M498DHs.min.js';

  // Default text style for dark theme (matches card design)
  const defaultTextStyle = textStyle || 'color: #f1f5f9; font-family: monospace; font-size: 14px; font-weight: 600;';

  // Map dataType to API paths
  const dataTypeConfig = {
    number: {
      path: `/cards/${cardId}/secure-data/number`,
      jsonPath: 'data.number',
      serializer: `secret.SERIALIZERS.replace('(\\\\d{4})(\\\\d{4})(\\\\d{4})(\\\\d{4})', '$1 $2 $3 $4')`,
    },
    cvv2: {
      path: `/cards/${cardId}/secure-data/cvv2`,
      jsonPath: 'data.cvv2',
      serializer: null,
    },
    defaultPin: {
      path: `/cards/${cardId}/secure-data/defaultPin`,
      jsonPath: 'data.defaultPin',
      serializer: null,
    },
  };

  const config = dataTypeConfig[dataType];
  const serializersArray = config.serializer ? `[${config.serializer}]` : '[]';

  // Generate the HTML content for the iframe
  const getHTML = () => {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: transparent;
      }
      #dataContainer {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        min-height: 20px;
        ${defaultTextStyle}
      }
      iframe {
        border: none;
        width: 100%;
        height: 20px;
        display: block;
      }
    </style>
  </head>
  <body>
    <div id="dataContainer"></div>

    <script
      type="text/javascript"
      src="${scriptUrl}"
      onerror="parent.postMessage({type: 'error', message: 'Failed to load SecureProxy script'}, '*')"
    ></script>
    <script type="text/javascript">
      try {
        const vaultId = '${vaultId}';
        const cardToken = '${cardToken}';
        const cardId = '${cardId}';

        // Verify SecureProxy is loaded
        if (typeof SecureProxy === 'undefined') {
          throw new Error('SecureProxy library not loaded');
        }

        parent.postMessage({
          type: 'debug',
          stage: 'init',
          data: { vaultId, cardId, dataType: '${dataType}' }
        }, '*');

        const secret = SecureProxy.create(vaultId);

        const iframe = secret.request({
          name: '${dataType}-text',
          method: 'GET',
          path: '${config.path}',
          headers: {
            Authorization: 'Bearer ' + cardToken,
          },
          htmlWrapper: 'text',
          jsonPathSelector: '${config.jsonPath}',
          serializers: ${serializersArray},
        });

        iframe.render('#dataContainer');

        parent.postMessage({
          type: 'debug',
          stage: 'rendered',
          data: { dataType: '${dataType}' }
        }, '*');

        // Listen for iframe load
        setTimeout(() => {
          parent.postMessage({
            type: 'loaded',
            dataType: '${dataType}'
          }, '*');
        }, 1500);

      } catch (error) {
        parent.postMessage({
          type: 'error',
          message: error.message,
          stack: error.stack
        }, '*');
      }
    </script>
  </body>
</html>`;
  };

  // Handle messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our iframe
      if (!event.data || typeof event.data !== 'object') return;

      const message = event.data;

      if (message.type === 'debug') {
        console.log(`[SudoSecureProxy:${message.stage}]`, message.data);
      } else if (message.type === 'loaded') {
        console.log('[SudoSecureDataView] Data loaded successfully for', dataType);
        setIsLoading(false);
        setError(null);
      } else if (message.type === 'error') {
        console.error('[SudoSecureDataView] Error loading data:', {
          dataType,
          cardId,
          error: message.message,
        });
        setError(message.message);
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [dataType, cardId]);

  // Create a blob URL for the iframe content
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const html = getHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [cardId, cardToken, dataType, vaultId]);

  return (
    <div className={cn('relative h-5 min-w-[60px]', className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        </div>
      )}

      {error && !isLoading && (
        <span className="font-mono text-sm text-slate-400">{placeholder}</span>
      )}

      {blobUrl && (
        <iframe
          ref={iframeRef}
          src={blobUrl}
          className={cn(
            'h-5 w-full border-none bg-transparent',
            isLoading && 'opacity-0'
          )}
          sandbox="allow-scripts allow-same-origin"
          title={`Secure ${dataType} data`}
        />
      )}
    </div>
  );
}

export default SudoSecureDataView;
