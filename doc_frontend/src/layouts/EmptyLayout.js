import { PureComponent } from 'react'

class EmptyLayout extends PureComponent {
  state = {
    isMobile: false,
  }

  componentDidMount() {}

  componentWillUnmount() {}

  onCollapseChange = collapsed => {}

  render() {
    return ''
  }
}

export default EmptyLayout
