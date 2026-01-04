export function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  result: 'win' | 'loss' | 'draw',
  kFactor: number
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  let actualScore: number;

  switch (result) {
    case 'win':
      actualScore = 1;
      break;
    case 'loss':
      actualScore = 0;
      break;
    case 'draw':
      actualScore = 0.5;
      break;
  }

  return Math.round(kFactor * (actualScore - expectedScore));
}
