import React from 'react';
import PropTypes from 'prop-types';

function findTouch(touches, identifier) {
  return Reflect.apply(
    Array.prototype.find,
    touches,
    [ (touch) => touch.identifier === identifier ]
  );
}

export const directionPrev = -1;
export const directionNext = 1;

export default class CarouselScroller extends React.Component {
  constructor(props) {
    super(props);

    this.handleScroll = this.handleScroll.bind(this);
    this.handleRefContainer = this.handleRefContainer.bind(this);
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.activeTouch = null;
    this.currSegment = 0;
    this.state = {
      currScroll: 0,
      minScroll: 0,
      maxScroll: -Infinity,
    };
    props.onConstructed({
      scroll: this.handleScroll,
      resize: this.handleResize,
    });
  }

  componentDidMount() {
    this.setState(this.getScrollState); // eslint-disable-line react/no-did-mount-set-state
  }

  componentWillReceiveProps(nextProps) {
    const { isVertical, listSize } = this.props;
    const hasIsVerticalChanged = isVertical !== nextProps.isVertical;
    const hasListSizeChanged = listSize !== nextProps.listSize;
    if (hasListSizeChanged || hasIsVerticalChanged) {
      // Reset scroll if orientation has changed.
      if (hasIsVerticalChanged) {
        this.setState({ currScroll: 0 });
      }
      this.setState((prevState) => this.getScrollState(prevState, nextProps));
    }
  }

  handleRefContainer(element) {
    this.refContainer = element;
  }

  handleScroll(direction) {
    setTimeout(this.props.onScrollStart);
    this.setState((prevState, props) => {
      const { minScroll, maxScroll } = prevState;
      const { scrollSize } = props;
      const distance = Math.sign(direction) * scrollSize;
      const currScroll = Math.min(
        Math.max(prevState.currScroll - distance, maxScroll),
        minScroll
      );
      return {
        currScroll,
      };
    });
  }

  handleTransitionEnd(evt) {
    const { currScroll, maxScroll, minScroll } = this.state;
    const { scrollSnapSize } = this.props;
    const currSegment = scrollSnapSize && Math.round(Math.abs(currScroll - minScroll) / scrollSnapSize);
    if (evt.target !== evt.currentTarget) {
      return;
    }

    setTimeout(this.props.onScrollEnd);
    if (currScroll === maxScroll) {
      setTimeout(this.props.onReachedEnd());
    }

    if (currScroll === minScroll) {
      setTimeout(this.props.onReachedStart());
    }

    if (!isNaN(currSegment) && currSegment !== this.currSegment) {
      setTimeout(() => this.props.onSegmentChange(currSegment));
      this.currSegment = currSegment;
    }
  }

  handleTouchStart(evt) {
    // There can be multiple touches, but we always track the first one.
    const [ touch ] = evt.touches;
    const { isVertical } = this.props;
    const positionProp = isVertical ? 'clientY' : 'clientX';
    this.activeTouch = {
      position: touch[positionProp],
      identifier: touch.identifier,
    };
  }

  handleTouchMove(evt) {
    if (!this.activeTouch) {
      return;
    }

    const { identifier, position } = this.activeTouch;
    const currTouch = findTouch(evt.changedTouches, identifier);
    if (!currTouch) {
      return;
    }

    const { isVertical, scrollDeadSize } = this.props;
    const positionProp = isVertical ? 'clientY' : 'clientX';
    const delta = position - currTouch[positionProp];
    if (Math.abs(delta) >= scrollDeadSize) {
      this.handleScroll(Math.sign(delta));
      // Once the scroll is launched, we consider the touch sequence finished.
      this.handleTouchEnd(evt);
    }
  }

  handleTouchEnd(evt) {
    if (!this.activeTouch) {
      return;
    }

    const { identifier } = this.activeTouch;
    // We want to finish the touch sequence only on the tracked touch.
    if (!findTouch(evt.changedTouches, identifier)) {
      return;
    }

    this.activeTouch = null;
  }

  handleResize() {
    this.setState(this.getScrollState);
  }

  getScrollState(state, props) {
    // First get new scroll boundries.
    const { isVertical, listSize, scrollSnapSize } = props;
    const sizeProp = isVertical ? 'offsetHeight' : 'offsetWidth';
    const newState = {
      minScroll: 0,
      maxScroll: -(listSize - this.refContainer[sizeProp]),
    };
    // Then check if the current scroll is within bounds
    // and stays pinned to the edges.
    const { minScroll, maxScroll } = state;
    let { currScroll } = state;
    // Pin the scroller's edge positions.
    if (currScroll === minScroll) {
      currScroll = newState.minScroll;
    } else if (currScroll === maxScroll) {
      currScroll = newState.maxScroll;
    // If not scrolled to the edge, ensure snapping if specified.
    } else if (scrollSnapSize) {
      currScroll = this.currSegment * -scrollSnapSize;
    }

    // Make sure current scroll is within bounds if resize happened.
    currScroll = Math.min(
      Math.max(currScroll, newState.maxScroll),
      newState.minScroll
    );

    return Object.assign(newState, { currScroll });
  }

  render() {
    const { isVertical } = this.props;
    const { currScroll } = this.state;
    const scrollerClass = `carousel-scroller--hwaccelerated carousel-scroller-${ isVertical ? 'y' : 'x' }`;
    const scrollerStyle = {
      transform: `translate3d(${ isVertical ? 0 : currScroll }px, ${ isVertical ? currScroll : 0 }px, 0px`,
    };
    return (
      <div className="carousel-scroller__container" ref={this.handleRefContainer}>
        <div
          className={scrollerClass}
          style={scrollerStyle}
          onTransitionEnd={this.handleTransitionEnd}
          onTouchStart={this.handleTouchStart}
          onTouchMove={this.handleTouchMove}
          onTouchEnd={this.handleTouchEnd}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

function noop() {
  return null;
}

CarouselScroller.defaultProps = {
  isVertical: false,
  scrollSize: 0,
  scrollDeadSize: 1,
  onConstructed: noop,
  onScrollStart: noop,
  onScrollEnd: noop,
  onReachedStart: noop,
  onReachedEnd: noop,
  onSegmentChange: noop,
};

if (process.env.NODE_ENV !== 'production') {
  CarouselScroller.propTypes = {
    children: PropTypes.node,
    isVertical: PropTypes.bool,
    scrollDeadSize: PropTypes.number,
    scrollSnapSize: PropTypes.number,
    scrollSize: PropTypes.number,
    listSize: PropTypes.number.isRequired,
    onConstructed: PropTypes.func,
    onScrollStart: PropTypes.func,
    onScrollEnd: PropTypes.func,
    onReachedStart: PropTypes.func,
    onReachedEnd: PropTypes.func,
    onSegmentChange: PropTypes.func,
  };
}
