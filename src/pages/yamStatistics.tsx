import { Divider } from '@mantine/core'

const YamStatistics = () => {
  return (
    <div>
      <h1>Yam Statistics</h1>
      <table style={{ width: '100%' }}>
        <tr style={{ textAlign: 'left' }}>
          <th>Token Price</th>
          <th>Yam Price</th>
          <th>Yam Difference (30 days)</th>
          <th>Yam Volume</th>
        </tr>
        <tr>
          <td>Token Price</td>
          <td>Yam Price</td>
          <td>Yam Difference</td>
          <td>Yam Volume</td>
        </tr>
        <tr>
          <td colSpan={4}>
            <Divider my={'xs'} />
          </td>
        </tr>
        <tr>
          <td>Token Price</td>
          <td>Yam Price</td>
          <td>Yam Difference</td>
          <td>Yam Volume</td>
        </tr>
      </table>
    </div>
  )
}

export default YamStatistics
