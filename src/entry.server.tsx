import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';
import { getRouteMetadata, type RouteMeta } from './utils/routeMetadata';
import type { DevelopmentPublic } from './types/development';

export interface RenderResult {
  html: string;
  statusCode: number;
  meta: RouteMeta;
}

export function render(
  url: string,
  context?: {
    developments?: DevelopmentPublic[];
    currentDevelopment?: DevelopmentPublic | null;
    explicitOrigin?: string | null;
  }
): RenderResult {
  const meta = getRouteMetadata(url, {
    currentDevelopment: context?.currentDevelopment,
    explicitOrigin: context?.explicitOrigin,
  });

  const html = renderToString(
    <StaticRouter location={url}>
      <App
        initialDevelopments={context?.developments}
        currentDevelopment={context?.currentDevelopment}
      />
    </StaticRouter>
  );

  return {
    html,
    statusCode: meta.statusCode,
    meta,
  };
}

