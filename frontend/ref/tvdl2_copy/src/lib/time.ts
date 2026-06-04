export function hhmmToMinutesNumber(time: string): number {
  const [hour, minute] = time.split(":").map(Number)
  return hour * 60 + minute
}