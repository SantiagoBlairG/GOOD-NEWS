import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Story } from '../../lib/schemas';
import { storyGeoJSON } from './filter';
import { MapPin } from 'lucide-react';
import { useApp } from '../../state/provider';
maplibregl.setWorkerUrl(workerUrl);
export default function StoryMap({
  stories,
  onSelect,
  preview = false,
}: {
  stories: Story[];
  onSelect: (ids: string[]) => void;
  preview?: boolean;
}) {
  const { reduced } = useApp();
  const reducedMotion = useRef(reduced);
  reducedMotion.current = reduced;
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const data = useRef(stories);
  const select = useRef(onSelect);
  data.current = stories;
  select.current = onSelect;
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  useEffect(() => {
    if (!container.current) return;
    let instance: maplibregl.Map | null = null;
    let disposed = false;
    let timer: number | undefined;
    try {
      const key = import.meta.env.VITE_MAPTILER_KEY;
      instance = new maplibregl.Map({
        container: container.current,
        style: key
          ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(key)}`
          : 'https://demotiles.maplibre.org/style.json',
        center: [0, 18],
        zoom: preview ? 1 : 1.3,
        attributionControl: { compact: true },
        interactive: !preview,
        renderWorldCopies: false,
      });
      map.current = instance;
      timer = window.setTimeout(() => {
        if (!disposed) setStatus('failed');
      }, 12000);
      instance.on('error', () => {
        if (!disposed) setStatus('failed');
      });
      instance.on('load', () => {
        if (disposed || !instance) return;
        clearTimeout(timer);
        setStatus('ready');
        instance.addSource('stories', {
          type: 'geojson',
          data: storyGeoJSON(data.current),
          cluster: true,
          clusterMaxZoom: 10,
          clusterRadius: 45,
        });
        instance.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'stories',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#087a35',
            'circle-radius': 22,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#fff',
          },
        });
        instance.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'stories',
          filter: ['has', 'point_count'],
          layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
          paint: { 'text-color': '#fff' },
        });
        instance.addLayer({
          id: 'places',
          type: 'circle',
          source: 'stories',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#087a35',
            'circle-radius': 12,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#fff',
          },
        });
        instance.on('click', 'places', (e) => {
          const ids = e.features?.[0]?.properties?.ids;
          if (typeof ids === 'string')
            try {
              select.current(JSON.parse(ids));
            } catch {
              /* Keep the list available for invalid provider data. */
            }
        });
        instance.on('click', 'clusters', async (e) => {
          if (!instance) return;
          const feature = e.features?.[0];
          const clusterId = feature?.properties?.cluster_id;
          if (typeof clusterId !== 'number') return;
          try {
            const source = instance.getSource('stories') as maplibregl.GeoJSONSource;
            const leaves = await source.getClusterLeaves(clusterId, 100, 0);
            const ids = leaves.flatMap(
              (l) => JSON.parse(String(l.properties?.ids ?? '[]')) as string[],
            );
            select.current(ids);
            const zoom = await source.getClusterExpansionZoom(clusterId);
            if (feature?.geometry.type === 'Point')
              instance.easeTo({
                center: feature.geometry.coordinates as [number, number],
                zoom,
                duration: reducedMotion.current ? 0 : 250,
              });
          } catch {
            setStatus('failed');
          }
        });
        for (const layer of ['places', 'clusters']) {
          instance.on('mouseenter', layer, () => {
            if (instance) instance.getCanvas().style.cursor = 'pointer';
          });
          instance.on('mouseleave', layer, () => {
            if (instance) instance.getCanvas().style.cursor = '';
          });
        }
      });
    } catch {
      setStatus('failed');
    }
    return () => {
      disposed = true;
      clearTimeout(timer);
      instance?.remove();
      map.current = null;
    };
  }, [preview]);
  useEffect(() => {
    const source = map.current?.getSource('stories') as maplibregl.GeoJSONSource | undefined;
    source?.setData(storyGeoJSON(stories));
  }, [stories]);
  return (
    <div className={'map-container ' + (preview ? 'compact-map' : '')}>
      <div
        ref={container}
        className="map-canvas"
        aria-label="Map of fictional story locations"
        role="region"
      />
      {status === 'loading' && (
        <div className="map-status" role="status">
          Opening a world of good…
        </div>
      )}
      {status === 'failed' && (
        <div className="map-status map-error" role="status">
          <MapPin />
          <strong>The map couldn’t load.</strong>
          <span>Browse every story in the list below.</span>
        </div>
      )}
      <span className="map-demo-note">
        Fictional story locations ·{' '}
        {import.meta.env.VITE_MAPTILER_KEY ? 'MapTiler' : 'Development demo map'}
      </span>
    </div>
  );
}
