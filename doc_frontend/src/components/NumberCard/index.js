import React from 'react'
import PropTypes from 'prop-types'
import { Card } from 'antd'
import CountUp from 'react-countup'
import iconMap from 'src/utils/iconMap'
import styles from './numberCard.less'


function Index({ icon, color, title, number, countUp }) {
  return (
    <Card
      className={styles.numberCard}
      bordered={true}
      bodyStyle={{ padding: 10 }}
    >
      <span className={styles.iconWarp} style={{ color }}>
        {iconMap[icon]}
      </span>
      <div className={styles.content}>
        <p className={styles.title}>{title || 'No Title'}</p>
        <p className={styles.number}>
          <CountUp
            start={0}
            end={number}
            duration={2.75}
            useEasing
            useGrouping
            separator=","
            {...(countUp || {})}
          />
        </p>
      </div>
    </Card>
  )
}

Index.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
  title: PropTypes.string,
  number: PropTypes.number,
  countUp: PropTypes.object,
}

export default Index
