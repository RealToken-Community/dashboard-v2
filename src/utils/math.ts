/*
 * get the Average Token multiplier to substract diff between last rent day
 * and rent start date
 */
export const getAverageTokenMult = (diff: number | undefined) => {
  if (diff === undefined) return 1
  const absDiff = Math.abs(diff)
  return absDiff > 7 ? 1 : (1 / 7) * absDiff
}
