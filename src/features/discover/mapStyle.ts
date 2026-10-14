import type { StyleSpecification, ExpressionSpecification } from 'maplibre-gl';

// Decorative country colors follow the owner's reference; they encode no story metrics.
const countryGreens: ExpressionSpecification = [
  'match',
  ['get', 'ADM0_A3'],
  ['CAN', 'RUS', 'ISL'],
  '#3d6026',
  ['GRL', 'AUS', 'IND', 'PAK', 'ZAF', 'NAM', 'BWA', 'TZA', 'MDG', 'IDN'],
  '#d5e383',
  ['CHN', 'DZA', 'SAU', 'TUR', 'EGY', 'ESP', 'POL'],
  '#afce36',
  ['BRA', 'ARG', 'MEX', 'FRA', 'SWE', 'FIN', 'IRN', 'JPN'],
  '#91bd42',
  ['USA', 'LBY', 'COL', 'DEU', 'KAZ', 'UKR', 'NOR'],
  '#6e9c3d',
  '#b8d45a',
];

export function greenMapStyle(
  _previous: StyleSpecification | undefined,
  style: StyleSpecification,
): StyleSpecification {
  return {
    ...style,
    name: 'Bright Side · Green world',
    layers: style.layers
      .filter((layer) => !layer.id.startsWith('geolines') && layer.type !== 'symbol')
      .map((layer) => {
        if (layer.type === 'background')
          return { ...layer, paint: { 'background-color': '#ffffff' } };
        if (layer.type === 'fill')
          return {
            ...layer,
            paint: {
              'fill-color':
                layer.id === 'countries-fill'
                  ? countryGreens
                  : /water|ocean|lake/i.test(layer.id)
                    ? '#ffffff'
                    : layer.id === 'crimea-fill'
                      ? '#6e9c3d'
                      : '#91bd42',
              'fill-opacity': 1,
              'fill-outline-color': '#eef3dc',
            },
          };
        if (layer.type === 'line')
          return {
            ...layer,
            paint: { 'line-color': '#eef3dc', 'line-width': 0.5, 'line-opacity': 0.8 },
          };
        return layer;
      }),
  };
}
