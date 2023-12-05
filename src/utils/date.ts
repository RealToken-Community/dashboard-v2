import moment from 'moment'

/*
 *get the first number of day difference between
 *occurence od day and afterDate  and get the number of day
 *( "Monday", "Tuesday",...) inside a date range
 *after or at a certain date
 */
export const numberOfDaysIn = (
  startDate: moment.Moment,
  endDate: moment.Moment,
  afterDate: moment.Moment,
  day: string
): [number | undefined, number] => {
  let nbDays = 0
  let diff = undefined
  let isFirst = true
  for (let m = startDate.clone(); m.isBefore(endDate); m.add(1, 'day')) {
    if (m.isSameOrAfter(afterDate) && m.clone().format('dddd') === day) {
      if (isFirst) {
        diff = afterDate.diff(m, 'days')
        isFirst = false
      }
      nbDays++
    }
  }
  return [diff, nbDays]
}
