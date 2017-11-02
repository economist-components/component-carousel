/* eslint-env browser */
import CarouselList from './parts/carousel-list';
import CarouselItem from './parts/carousel-item';
import CarouselControl from './parts/carousel-control';
import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';

export default class Carousel extends React.Component {

  constructor(props) {
    super(props);
    this.debounceWait = 100;
    this.handlePreviousClick = this.handleControlClick.bind(this, 'previous');
    this.handleNextClick = this.handleControlClick.bind(this, 'next');
    this.makeDebouncedDimensionslUpdateFunction = this.makeDebouncedDimensionslUpdateFunction.bind(this);
    this.computeNumToScroll = this.computeNumToScroll.bind(this);
    this.forceScrollUp = this.forceScrollUp.bind(this);
    this.forceScrollDown = this.forceScrollDown.bind(this);
    this.reachedStart = this.reachedStart.bind(this);
    this.reachedEnd = this.reachedEnd.bind(this);
    this.state = {
      listElementDimension: 0,
      listDimension: 0,
      isInitialPosition: true,
      isFinalPosition: false,
    };
    this.numOfItemsToScrollBy = 1;
    this.scrollWidth = 0;
    this.scroller = null;
    this.scrollerRef = null;
  }

  componentDidMount() {
    this.computeNumToScroll();
    // ftscroller must be required only on the client, as it accesses window.document on require
    const Scroller = require('ftscroller').FTScroller; // eslint-disable-line global-require
    const scrollerElement = this.scrollerRef;
    const {
      children,
      gutter,
      scrollerOptions,
      vertical,
      visibleItems,
      width,
      enablePassThrough = !vertical,
    } = this.props;
    let listElementDimension = 0;
    if (width) {
      listElementDimension = width;
      this.scrollWidth = width * this.numOfItemsToScrollBy;
    } else {
      listElementDimension = this.computeDimensions(
        scrollerElement,
        visibleItems,
        gutter,
        this.props.vertical
      );
      this.scrollWidth = listElementDimension * this.numOfItemsToScrollBy;
    }
    const scrollingDirection = { scrollingY: vertical, scrollingX: !vertical };
    const passThroughOptions = enablePassThrough ? {
      scrollBoundary: 65,
      scrollResponseBoundary: 65,
    } : null;
    this.setState({ // eslint-disable-line react/no-did-mount-set-state
      listElementDimension,
      listDimension: listElementDimension * children.length,
    }, () => {
      this.scroller = new Scroller(
        scrollerElement,
        Object.assign({}, scrollingDirection, passThroughOptions, scrollerOptions)
      );
      if (typeof this.props.onScrollerCreated === 'function') {
        this.props.onScrollerCreated(this.scroller);
      }
      if (typeof this.props.onScrollerSegmentdidchange === 'function') {
        this.scroller.addEventListener('segmentdidchange', this.props.onScrollerSegmentdidchange, this.scroller);
      }
      this.scroller.addEventListener('scrollstart', this.forceScrollUp);
      this.scroller.addEventListener('scrollend', this.forceScrollDown);
      this.scroller.addEventListener('reachedstart', this.reachedStart);
      this.scroller.addEventListener('reachedend', this.reachedEnd);
      window.addEventListener('resize', this.makeDebouncedDimensionslUpdateFunction());
    });
  }

  componentWillUnmount() {
    if (this.scroller) {
      if (typeof this.props.onScrollerSegmentdidchange === 'function') {
        this.scroller.removeEventListener('segmentdidchange', this.props.onScrollerSegmentdidchange);
      }
      this.scroller.removeEventListener('scrollstart', this.forceScrollUp);
      this.scroller.removeEventListener('scrollend', this.forceScrollDown);
      this.scroller.removeEventListener('reachedstart', this.reachedStart);
      this.scroller.removeEventListener('reachedend', this.reachedEnd);
      window.removeEventListener('resize', this.debouncedDimensionsUpdateFunction);
    }
  }

  makeDebouncedDimensionslUpdateFunction() {
    this.computeNumToScroll();
    this.debouncedDimensionsUpdateFunction = debounce(() => {
      const scrollerElement = this.scrollerRef;
      const { children, gutter, vertical, visibleItems, width } = this.props;
      const newListElementDimension = this.computeDimensions(
        scrollerElement,
        visibleItems,
        gutter,
        vertical
      );
      if (newListElementDimension && !width) {
        const newListDimension = newListElementDimension * children.length;
        this.scroller.updateDimensions(newListDimension - gutter, scrollerElement.offsetHeight);
        this.setState({
          listElementDimension: newListElementDimension,
          listDimension: newListDimension,
        });
        this.scrollWidth = newListElementDimension * this.numOfItemsToScrollBy;
      }
    }, this.debounceWait);
    return this.debouncedDimensionsUpdateFunction;
  }

  computeDimensions(scrollerElement, visibleItems, gutter, vertical) {
    return vertical ?
      (scrollerElement.offsetHeight + gutter) / visibleItems :
      (scrollerElement.offsetWidth + gutter) / visibleItems;
  }

  forceScrollUp() {
    this.setState({ isInitialPosition: false, isFinalPosition: false });
    if (this.props.onScrollCallbackUp) {
      this.props.onScrollCallbackUp();
    }
  }
  forceScrollDown() {
    if (this.props.onScrollCallbackDown) {
      this.props.onScrollCallbackDown();
    }
  }
  reachedStart() {
    this.setState({ isInitialPosition: true });
  }
  reachedEnd() {
    this.setState({ isFinalPosition: true });
  }

  computeNumToScroll() {
    if (this.props.computeScrollNumber) {
      // This is to support IE9.
      // If window.matchMedia does not exist then set the variable to 1.
      if (!window.matchMedia) {
        this.numOfItemsToScrollBy = 1;
        return;
      }
      if (window.matchMedia('(min-width: 1300px)').matches) {
        this.numOfItemsToScrollBy = 4;
      } else if (window.matchMedia('(min-width: 940px)').matches) {
        this.numOfItemsToScrollBy = 3;
      } else if (window.matchMedia('(min-width: 640px)').matches) {
        this.numOfItemsToScrollBy = 2;
      } else {
        this.numOfItemsToScrollBy = 1;
      }
    }
  }

  handleControlClick(direction, event) {
    event.stopPropagation();
    const scrollSpan = direction === 'previous' ? -this.scrollWidth : this.scrollWidth;
    if (this.props.vertical) {
      this.scroller.scrollBy(0, scrollSpan, true);
    } else {
      this.scroller.scrollBy(scrollSpan, 0, true);
    }
    event.preventDefault();
  }

  createKeyDownHandler(clickHandle) {
    return function handleKeyDown(event) {
      switch (event.keyCode) {
        case 13: // eslint-disable-line no-magic-numbers
        case 32: { // eslint-disable-line no-magic-numbers
          clickHandle(event);
          break;
        }
        default:
      }
    };
  }

  render() {
    const { children, gutter, nextButton, previousButton, vertical } = this.props;
    const styles = '.carousel__control { display: none !important } .carousel__list { overflow-x: scroll; }';
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
    // Rendering noscript tag from server because of the issue in the link below.
    // https://github.com/facebook/react/issues/7607
    // The noscript tag causes react to fail and so have to render on the server.
    const noScript = typeof window === 'undefined' ?
      (
        <noscript>
          {/* eslint-disable react/no-danger  */}
          <style dangerouslySetInnerHTML={{ __html: styles }} />
          {/* eslint-enable react/no-danger  */}
        </noscript>
      ) :
      null;
    const hidePreviousButton = this.props.hideArrowsOnEdges && this.state.isInitialPosition;
    const hideNextButton = this.props.hideArrowsOnEdges && this.state.isFinalPosition;
    return (
      <div className="carousel">
        {
          previousButton &&
          <CarouselControl
            style={{ display: hidePreviousButton ? 'none' : '' }}
            direction="previous"
            onClick={this.handlePreviousClick}
            onKeyDown={this.createKeyDownHandler(this.handlePreviousClick)}
          >
            {previousButton}
          </CarouselControl>
        }
        {/* eslint-disable react/jsx-no-bind, brace-style  */}
        <div className="carousel__wrapper" ref={(ref) => { this.scrollerRef = ref; }}>
          <CarouselList
            dimension={this.state.listDimension}
            gutter={gutter}
            vertical={vertical}
          >
            {carouselItems}
          </CarouselList>
        </div>
         {/* eslint-enable react/jsx-no-bind, brace-style  */}
        {
          nextButton &&
          <CarouselControl
            style={{ display: hideNextButton ? 'none' : '' }}
            direction="next"
            onClick={this.handleNextClick}
            onKeyDown={this.createKeyDownHandler(this.handleNextClick)}
          >
            {nextButton}
          </CarouselControl>
        }
        {noScript}
      </div>
    );
  }
}

Carousel.defaultProps = {
  computeScrollNumber: true,
  scrollerOptions: {
    scrollbars: false,
    updateOnWindowResize: true,
  },
  visibleItems: 4,
};

if (process.env.NODE_ENV !== 'production') {
  Carousel.propTypes = {
    children: PropTypes.arrayOf(PropTypes.node),
    computeScrollNumber: PropTypes.bool,
    enablePassThrough: PropTypes.bool,
    nextButton: PropTypes.node,
    previousButton: PropTypes.node,
    gutter: PropTypes.number,
    hideArrowsOnEdges: PropTypes.bool,
    onScrollerCreated: PropTypes.func,
    onScrollerSegmentdidchange: PropTypes.func,
    scrollerOptions: PropTypes.shape({
      alwaysScroll: PropTypes.bool,
      baseAlignments: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
      }),
      bouncing: PropTypes.bool,
      contentWidth: PropTypes.number,
      contentHeight: PropTypes.number,
      disabledInputMethods: PropTypes.shape({
        mouse: PropTypes.bool,
        touch: PropTypes.bool,
        scroll: PropTypes.bool,
        pointer: PropTypes.bool,
        focus: PropTypes.bool,
      }),
      enableRequestAnimationFrameSupport: PropTypes.bool,
      flinging: PropTypes.bool,
      hwAccelerationClass: PropTypes.string,
      maxFlingDuration: PropTypes.number,
      scrollbars: PropTypes.bool,
      scrollBoundary: PropTypes.number,
      scrollingClassName: PropTypes.string,
      scrollResponseBoundary: PropTypes.number,
      scrollingX: PropTypes.bool,
      scrollingY: PropTypes.bool,
      singlePageScrolls: PropTypes.bool,
      snapping: PropTypes.bool,
      snapSizeX: PropTypes.number,
      snapSizeY: PropTypes.number,
      updateOnChanges: PropTypes.bool,
      updateOnWindowResize: PropTypes.bool,
      windowScrollingActiveFlag: PropTypes.string,
      flingBezier: PropTypes.string,
      bounceDecelerationBezier: PropTypes.string,
      bounceBezier: PropTypes.string,
      invertScrollWheel: PropTypes.bool,
    }),
    vertical: PropTypes.bool,
    visibleItems: PropTypes.number,
    width: PropTypes.number,
    onScrollCallbackUp: PropTypes.func,
    onScrollCallbackDown: PropTypes.func,
  };
}
