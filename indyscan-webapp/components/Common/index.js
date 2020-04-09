import { Label } from 'semantic-ui-react'

export function renderValuesAsBadges (id, data) {
  if (!data) {
    return
  }
  let badgeValues = Object.values(data)
  return badgeValues.map((value, i) => <Label key={`label-${id}-${i}`} style={{ margin: 3 }}>{value}</Label>)
}

export function renderKeyValuesAsBadges (id, keyValues, valueColor) {
  if (!keyValues) {
    return
  }
  let items = []
  for (const [key, value] of Object.entries(keyValues)) {
    if (value) {
      items.push(<Label key={`label-${id}-${key}`} style={{ margin: 3 }}>{`${key}: `}<span
        style={{ color: valueColor }}>{value}</span></Label>)
    }
  }
  return items
}
