/* global window */
import React from 'react';
import PropTypes from 'prop-types';

const transitionProps = [ 'transition', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition' ];
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

    this.handleScrollRequest = this.handleScrollRequest.bind(this);
    this.handleRefContainer = this.handleRefContainer.bind(this);
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handlePageTouchMove = this.handlePageTouchMove.bind(this);
    this.isTransitionSupported = false;
    this.activeTouch = null;
    this.currSegment = 0;
    this.state = {
      currScroll: 0,
      minScroll: 0,
      maxScroll: -Infinity,
      isTransitionEnabled: false,
    };
    props.onConstructed({
      scroll: this.handleScrollRequest,
      resize: this.handleResize,
    });
  }

  componentDidMount() {
    const element = this.refContainer;
    // We need to check if transtions are enabled.
    // If not, then we need to short-circuit handleTransitionEnd
    // in componentDidUpdate.
    this.isTransitionSupported = transitionProps.some((prop) => typeof element.style[prop] !== 'undefined');

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState(this.getScrollState);
    if (typeof window === 'object') {
      window.addEventListener('touchmove', this.handlePageTouchMove, { capture: true, passive: false });
    }
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

  componentDidUpdate(prevProps, prevState) {
    const { currScroll, isTransitionEnabled } = this.state;
    const { isAnimated } = this.props;
    if (currScroll !== prevState.currScroll) {
      // If there was supposed to be a transition
      // but the transition is *NOT* supported nor desired,
      // we want to fire the end of transition ourselves.
      if (isTransitionEnabled && (!this.isTransitionSupported || !isAnimated)) {
        this.handleTransitionEnd();
      }

      if (!isTransitionEnabled) {
        this.handleScrollChange();
      }
    }
  }

  componentWillUnmount() {
    if (typeof window === 'object') {
      window.removeEventListener('touchmove', this.handlePageTouchMove);
    }
  }

  handleRefContainer(element) {
    this.refContainer = element;
  }

  handleScrollRequest(direction) {
    this.setState((prevState, props) => {
      const { minScroll, maxScroll } = prevState;
      let { isTransitionEnabled } = prevState;
      const { scrollSize } = props;
      const distance = Math.sign(direction) * scrollSize;
      const currScroll = Math.min(
        Math.max(prevState.currScroll - distance, maxScroll),
        minScroll
      );
      if (currScroll !== prevState.currScroll) {
        isTransitionEnabled = true;
        setTimeout(this.props.onScrollStart);
      }

      return {
        currScroll,
        isTransitionEnabled,
      };
    });
  }

  handleScrollChange() {
    const { currScroll, maxScroll, minScroll } = this.state;
    const { scrollSnapSize } = this.props;
    const currSegment = scrollSnapSize && Math.round(Math.abs(currScroll - minScroll) / scrollSnapSize);
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

    this.setState({
      isTransitionEnabled: false,
    });
  }

  handleTransitionEnd(evt) {
    // When we fire the transition end manually there is no event passed.
    if (evt && evt.target !== evt.currentTarget) {
      return;
    }

    setTimeout(this.props.onScrollEnd);
    this.handleScrollChange();
  }

  handleTouchStart(evt) {
    // There can be multiple touches, but we always track the first one.
    const [ touch ] = evt.touches;
    this.activeTouch = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      identifier: touch.identifier,
      hasTriggeredScroll: false,
      hasDirection: false,
    };
  }

  handleTouchMove(evt) {
    const { activeTouch } = this;
    if (!activeTouch) {
      return;
    }

    const { identifier, hasTriggeredScroll } = activeTouch;
    if (hasTriggeredScroll) {
      return;
    }

    const currTouch = findTouch(evt.changedTouches, identifier);
    if (!currTouch) {
      this.activeTouch = null;
      return;
    }

    const { isVertical, scrollDeadSize } = this.props;
    // We need to track touch movement in both the chosen direction
    // as well as perpendicular in order to figure out
    // if the movement is supposed to trigger carousel or page scroll.
    const directionProp = isVertical ? 'clientY' : 'clientX';
    const perpendicularProp = isVertical ? 'clientX' : 'clientY';
    const directionDelta = activeTouch[directionProp] - currTouch[directionProp];
    const perpendicularDelta = activeTouch[perpendicularProp] - currTouch[perpendicularProp];
    const absDirectionDelta = Math.abs(directionDelta);
    const absPerpendicularDelta = Math.abs(perpendicularDelta);
    // If touch movement was more in perpendicular direction before we triggered the carousel scroll,
    // then we abandon touch tracking and thus let the browser take care of page scroll.
    if (!hasTriggeredScroll && absDirectionDelta <= absPerpendicularDelta) {
      this.activeTouch = null;
      return;
    }

    // We want to figure out early on if the touch movement is going in the right direction
    // so that we can disable page scroll.
    if (absDirectionDelta > absPerpendicularDelta) {
      activeTouch.hasDirection = true;
    }

    if (absDirectionDelta >= scrollDeadSize) {
      activeTouch.hasTriggeredScroll = true;
      // We schedule scroll request further on the event loop
      // just in case transitionend is already waiting there.
      setTimeout(() => this.handleScrollRequest(Math.sign(directionDelta)));
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

  handlePageTouchMove(evt) {
    // If active touch triggered carousel scroll, then we don't want
    // to have the same touch trigger page scroll.
    // This way we are preventing page and carousel scroll at the same time.
    if (this.activeTouch && this.activeTouch.hasDirection) {
      evt.preventDefault();
    }
  }

  // Used to recalculate scroll state (min, max, current)
  // in case of resize or orientation change.
  // It ensures that the current scroll is within limits
  // and still reflects current segement.
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
    const { isVertical, isAnimated } = this.props;
    const { currScroll, isTransitionEnabled } = this.state;
    const scrollerClass = [ 'carousel-scroller', `carousel-scroller--${ isVertical ? 'y' : 'x' }` ];
    const scrollerStyle = {
      transform: `translate3d(${ isVertical ? 0 : currScroll }px, ${ isVertical ? currScroll : 0 }px, 0px`,
    };
    if (this.isTransitionSupported && isTransitionEnabled && isAnimated) {
      scrollerClass.push('carousel-scroller--transitioned');
    }

    return (
      <div className="carousel-scroller__container" ref={this.handleRefContainer}>
        <div
          className={scrollerClass.join(' ')}
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
  isAnimated: true,
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
    isAnimated: PropTypes.bool,
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
