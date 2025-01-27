import { ExpressionSpecification, Level } from './Types';

export function filterWithLevel(
  initialFilter: ExpressionSpecification,
  level: Level,
  showFeaturesWithEmptyLevel: boolean = false
): ExpressionSpecification {
  return [
    'all',
    initialFilter,
    [
      'any',
      showFeaturesWithEmptyLevel ? ['!', ['has', 'level']] : ['literal', false],
      [
        'all',
        ['has', 'level'],
        [
          'any',
          ['==', ['get', 'level'], level.toString()], // replacing below
          // ['==', ['get', 'level'], level.toString()],
          ['literal', true], // replacing below
          //   [
          //     'all',
          //     ['!=', ['index-of', ';', ['get', 'level']], -1],
          //     [
          //       '>=',
          //       level,
          //       ['to-number', ['slice', ['get', 'level'], 0, ['index-of', ';', ['get', 'level']]]],
          //     ],
          //     [
          //       '<=',
          //       level,
          //       [
          //         'to-number',
          //         ['slice', ['get', 'level'], ['+', ['index-of', ';', ['get', 'level']], 1]],
          //       ],
          //     ],
          //   ],
        ],
      ],
    ],
  ];
}
