const CDN_HOST = 'https://cdn.sanity.io';

export function getAssetIdFromSource(source) {

  if (!source) return null;
  if (typeof source === 'string') return source;
  if (source.asset?._ref) return source.asset._ref;
  if (source.asset?._id) return source.asset._id;
  if (source._ref) return source._ref;
  if (source._id) return source._id;
  return null;
}

export function parseAssetId(id) {

  const withoutPrefix = id.startsWith('image-') ? id.slice('image-'.length) : id;
  const parts = withoutPrefix.split('-');
  if (parts.length < 3) return null;
  const format = parts[parts.length - 1];
  const dimensions = parts[parts.length - 2];
  const assetId = parts.slice(0, parts.length - 2).join('-');
  const [width, height] = dimensions.split('x').map((n) => parseInt(n, 10));
  return { assetId, width, height, format };
}

function buildUrl({ projectId, dataset, assetId, width, height, format, options }) {
  
  const path = `${CDN_HOST}/images/${projectId}/${dataset}/${assetId}-${width}x${height}.${format}`;
  const params = new URLSearchParams();

  if (options.width) params.set('w', String(Math.round(options.width)));
  if (options.height) params.set('h', String(Math.round(options.height)));
  if (options.fit) params.set('fit', options.fit);
  if (options.quality !== undefined) params.set('q', String(options.quality));
  if (options.dpr && options.dpr !== 1) params.set('dpr', String(options.dpr));
  if (options.auto) params.set('auto', options.auto);
  if (options.sharpen) params.set('sharp', String(options.sharpen));
  if (options.blur) params.set('blur', String(options.blur));

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function createImageUrlBuilder(config) {
  function makeBuilder(source, options) {
    return {
      withOptions(nextOptions) {
        return makeBuilder(source, { ...options, ...nextOptions });
      },
      image(nextSource) {
        return makeBuilder(nextSource, options);
      },
      url() {
        const rawId = getAssetIdFromSource(source);
        if (!rawId) return '';
        const parsed = parseAssetId(rawId);
        if (!parsed) return '';
        
        const isUnsafeFormat = ['heif', 'heic'].includes(parsed.format?.toLowerCase());
        const format = options.format ?? (isUnsafeFormat ? 'webp' : parsed.format);
        return buildUrl({
          projectId: config.projectId,
          dataset: config.dataset,
          assetId: parsed.assetId,
          width: parsed.width,
          height: parsed.height,
          format,
          options,
        });
      },
    };
  }

  return makeBuilder(null, {});
}
