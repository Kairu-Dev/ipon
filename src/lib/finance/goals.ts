export function calculateGoalProgress(savedAmount: number, targetAmount: number): number {
  if (targetAmount === 0) return 0;
  return Math.min(Math.floor((savedAmount / targetAmount) * 100), 100);
}
