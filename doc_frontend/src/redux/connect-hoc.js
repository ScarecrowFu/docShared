// eslint-disable-next-line no-unused-vars
export default connect => (mapStateToProps = state => ({})) => (WrappedComponent) => connect({mapStateToProps, LayoutComponent: WrappedComponent});
