import { FC } from 'react'

import { createStyles } from '@mantine/core'

const useStyles = createStyles({
  table: {
    width: '100%',
    '& td:nth-of-type(2)': {
      textAlign: 'right',
    },
  },
})

interface AssetPageTableProps {
  data: {
    label: string
    value: string
    isHidden?: boolean
    isIndented?: boolean
  }[]
}

export const AssetPageTable: FC<AssetPageTableProps> = ({ data }) => {
  const { classes } = useStyles()
  return (
    <table className={classes.table}>
      <tbody>
        {data
          .filter((item) => !item.isHidden)
          .map((item, index) => (
            <tr key={index}>
              <td style={item.isIndented ? { paddingLeft: '10px' } : undefined}>
                {item.isIndented && <span>{'- '}</span>}
                {item.label}
              </td>
              <td>{item.value}</td>
            </tr>
          ))}
      </tbody>
    </table>
  )
}

AssetPageTable.displayName = 'AssetPageTable'
