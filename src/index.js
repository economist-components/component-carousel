/* eslint-env browser */
import CarouselList from './parts/carousel-list';
import CarouselItem from './parts/carousel-item';
import CarouselControl from './parts/carousel-control';
import CarouselScroller, { directionPrev, directionNext } from './parts/carousel-scroller';
import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';

export default class Carousel extends React.Component {

  constructor(props) {
    super(props);
    this.debounceWait = 100;
    this.handleScrollerCreated = this.handleScrollerCreated.bind(this);
    this.handleNext = this.handleControlAction.bind(this, directionNext);
    this.handlePrevious = this.handleControlAction.bind(this, directionPrev);
    this.handleResize = this.handleResize.bind(this);
    this.debouncedHandleResize = debounce(this.handleResize, this.debounceWait);
    this.handleScrollStart = this.handleScrollStart.bind(this);
    this.handleScrollEnd = this.handleScrollEnd.bind(this);
    this.handleReachedStart = this.handleReachedStart.bind(this);
    this.handleReachedEnd = this.handleReachedEnd.bind(this);
    this.handleRefScroller = this.handleRefScroller.bind(this);
    this.state = {
      listElementDimension: 0,
      listDimension: 0,
      scrollSize: 0,
      isInitialPosition: true,
      isFinalPosition: false,
    };
    this.scroller = null;
    this.refScroller = null;
  }

  componentDidMount() {
    this.setState( // eslint-disable-line react/no-did-mount-set-state
      this.getSizeState,
      () => window.addEventListener('resize', this.debouncedHandleResize)
    );
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedHandleResize);
  }

  getSizeState(state, props) {
    let scrollItems = 1;
    if (props.computeScrollNumber && window && window.matchMedia) {
      if (window.matchMedia('(min-width: 1300px)').matches) {
        scrollItems = 4;
      } else if (window.matchMedia('(min-width: 940px)').matches) {
        scrollItems = 3;
      } else if (window.matchMedia('(min-width: 640px)').matches) {
        scrollItems = 2;
      }
    }

    scrollItems = Math.min(scrollItems, props.visibleItems);

    const scrollerElement = this.refScroller;
    const { children, gutter, vertical, visibleItems, width } = this.props;
    let listElementDimension = width;
    if (!width) {
      const sizeProp = vertical ? 'offsetHeight' : 'offsetWidth';
      listElementDimension = (scrollerElement[sizeProp] + gutter) / visibleItems;
    }

    return {
      listElementDimension,
      listDimension: listElementDimension * children.length - gutter,
      scrollSize: listElementDimension * scrollItems,
    };
  }

  handleResize() {
    this.setState(this.getSizeState);
    this.scroller.resize();
  }

  handleScrollStart() {
    this.setState({ isInitialPosition: false, isFinalPosition: false });
    setTimeout(this.props.onScrollStart);
  }

  handleScrollEnd() {
    setTimeout(this.props.onScrollEnd);
  }

  handleReachedStart() {
    this.setState({ isInitialPosition: true });
  }

  handleReachedEnd() {
    this.setState({ isFinalPosition: true });
  }

  handleScrollerCreated(scroller) {
    this.scroller = scroller;
  }

  handleControlAction(direction, event) {
    if (
      event.type === 'keydown' &&
      (event.keyCode !== 13 || event.keyCode !== 32) // eslint-disable-line no-magic-numbers
    ) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    this.scroller.scroll(direction);
  }

  handleRefScroller(element) {
    this.refScroller = element;
  }

  render() {
    const { children, gutter, nextButton, previousButton, vertical, onSegmentChange } = this.props;
    const carouselItems = children.map(
      (child, index) =>
        <CarouselItem
          key={index}
          dimension={this.state.listElementDimension}
          gutter={gutter}
          vertical={vertical}
        >
          {child}
        </CarouselItem>
    );
    // listStyle and hasControlsEnabled are used to distinguish between client and server side rendering.
    const listStyle = typeof window === 'undefined' && !vertical ? { overflowX: 'scroll' } : null;
    const hasControlsEnabled = typeof window === 'object';
    const hidePreviousButton = hasControlsEnabled && this.props.hideArrowsOnEdges && this.state.isInitialPosition;
    const hideNextButton = hasControlsEnabled && this.props.hideArrowsOnEdges && this.state.isFinalPosition;
    return (
      <div className="carousel">
        {
          previousButton &&
          <CarouselControl
            style={{ display: hidePreviousButton ? 'none' : '' }}
            direction="previous"
            onClick={this.handlePrevious}
            onKeyDown={this.handlePrevious}
          >
            {previousButton}
          </CarouselControl>
        }
        <div className="carousel__wrapper" ref={this.handleRefScroller}>
          <CarouselScroller
            onConstructed={this.handleScrollerCreated}
            isVertical={this.props.vertical}
            listSize={this.state.listDimension}
            scrollSize={this.state.scrollSize}
            scrollDeadSize={64}
            scrollSnapSize={this.state.listElementDimension}
            onScrollStart={this.handleScrollStart}
            onScrollEnd={this.handleScrollEnd}
            onReachedStart={this.handleReachedStart}
            onReachedEnd={this.handleReachedEnd}
            onSegmentChange={onSegmentChange}
          >
            <CarouselList
              dimension={this.state.listDimension}
              gutter={gutter}
              vertical={vertical}
              style={listStyle}
            >
              {carouselItems}
            </CarouselList>
          </CarouselScroller>
        </div>
        {
          nextButton &&
          <CarouselControl
            style={{ display: hideNextButton ? 'none' : '' }}
            direction="next"
            onClick={this.handleNext}
            onKeyDown={this.handleNext}
          >
            {nextButton}
          </CarouselControl>
        }
      </div>
    );
  }
}

function noop() {
  return null;
}

Carousel.defaultProps = {
  computeScrollNumber: true,
  scrollDeadSize: 65,
  visibleItems: 4,
  onSegmentChange: noop,
};

if (process.env.NODE_ENV !== 'production') {
  Carousel.propTypes = {
    children: PropTypes.arrayOf(PropTypes.node),
    computeScrollNumber: PropTypes.bool,
    scrollDeadSize: PropTypes.number,
    nextButton: PropTypes.node,
    previousButton: PropTypes.node,
    gutter: PropTypes.number,
    hideArrowsOnEdges: PropTypes.bool,
    vertical: PropTypes.bool,
    visibleItems: PropTypes.number,
    width: PropTypes.number,
    onSegmentChange: PropTypes.func,
    onScrollStart: PropTypes.func,
    onScrollEnd: PropTypes.func,
  };
}
