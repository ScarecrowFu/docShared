import React from 'react'
import PropTypes from 'prop-types'
import { Typography, Avatar } from 'antd'
import styles from './user.less'
import avatar from './avatar.jpeg'


function UserCard({username, email, github, desc}) {
  const {  Paragraph } = Typography;

  return (
    <div className={styles.user}>
      <div className={styles.header}>
        <div className={styles.headerinner}>
          <Avatar size="large" src={avatar} />
          <h5 className={styles.name}>{username}</h5>
        </div>
      </div>
      <div className={styles.number}>
        <div className={styles.item}>
          <p>Email</p>
          <p style={{ color: '#64ea91' }}>
            <a href={`mailto:${email}`} target="_blank" rel="noreferrer">{email}</a>
          </p>
        </div>
        <div className={styles.item}>
          <p>Github</p>
          <p style={{ color: '#8fc9fb' }}>
            <a href={github} target="_blank" rel="noreferrer">{github}</a>
          </p>
        </div>
      </div>
      <div className={styles.footer}>
        <Paragraph>
        <blockquote >{desc}</blockquote>
        <blockquote>曾想着仗剑走天涯，木剑出门，即入江湖。</blockquote>
        <blockquote>在江湖中闯荡，迷茫又着急。想要房子，想要车子，想要旅行，想要享受生活。 那么年轻却窥觑整个世界，那么浮躁却想要看透生活。不断催促自己赶快成长，却沉不下心来安静的读一篇文章；一次次吹响前进的号角，却总是倒在离出发不远的地方；看过听过很多道理，自以为已经明白，却总是重复同样的错误；一次次的受伤，却仍然没有学会如何避免，只会埋怨江湖过于凶险。</blockquote>
        <blockquote>直到木剑已断，手中再无武器。直到不再年轻，即便吹响号角也无法冲刺。环顾四周，人人利器在手，披荆斩棘。</blockquote>
        <blockquote>在懊悔的过程中，总是看着别人，以此来构想不同于自己的生活。可是有一天发现，我就是我，我生命的烙印，不会因为我的遐想而改变。这时所能做的就是接受它，并尊重它。</blockquote>
        <blockquote>江湖还在那里，是否可以停下来想一想，重新铸造自己的武器，休养伤口，再入江湖？</blockquote>
        </Paragraph>
      </div>

    </div>
  )
}

UserCard.propTypes = {
  avatar: PropTypes.string,
  username: PropTypes.string,
  email: PropTypes.string,
  github: PropTypes.string,
  desc: PropTypes.string,
}

export default UserCard
