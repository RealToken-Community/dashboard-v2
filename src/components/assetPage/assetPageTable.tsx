import React, { FC } from 'react'

import { Divider, createStyles } from '@mantine/core'

const useStyles = createStyles({
  table: {
    width: '100%',
    '& td:nth-of-type(2)': {
      textAlign: 'right',
    },
  },
})

export interface AssetPageTableProps {
  data: {
    label: string
    value: string
    isHidden?: boolean
    isIndented?: boolean
    separator?: boolean
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
            <React.Fragment key={index}>
              {item.separator && (
                <tr>
                  <td colSpan={2}>
                    <Divider my={'xs'} />
                  </td>
                </tr>
              )}
              <tr>
                <td
                  style={item.isIndented ? { paddingLeft: '10px' } : undefined}
                >
                  {item.isIndented && <span>{'- '}</span>}
                  {item.label}
                </td>
                <td>{item.value}</td>
              </tr>
            </React.Fragment>
          ))}
      </tbody>
    </table>
  )
}

AssetPageTable.displayName = 'AssetPageTable'
