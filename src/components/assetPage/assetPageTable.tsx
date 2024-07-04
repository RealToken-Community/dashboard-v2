import React, { FC } from 'react'

import { Divider } from '@mantine/core'

import styles from './assetPageTable.module.sass'

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
  return (
    <table className={styles.table}>
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
