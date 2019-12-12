import { Label } from 'semantic-ui-react'

export function renderAsBadges (id, data) {
  if (!data) {
    return
  }
  let badgeValues = []
  if (Array.isArray(data)) {
    badgeValues = data
  } else {
    const keys = Object.keys(data)
    badgeValues = keys.map(k => { return { [k]: data[k] } })
  }
  let badges = []
  for (let i = 0; i < badgeValues.length; i++) {
    badges.push(<Label key={`lalbel-${id}-${i}`}style={{ margin: 3 }}>{badgeValues[i]}</Label>)
  }
  return badges
}
