/* eslint-env browser */
import CarouselList from './parts/carousel-list';
import CarouselItem from './parts/carousel-item';
import CarouselControl from './parts/carousel-control';
import React from 'react';
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
    this.state = {
      listElementDimension: 0,
      listDimension: 0,
    };
    this.numOfItemsToScrollBy = 0;
    this.scrollWidth = 0;
  }

  componentDidMount() {
    this.computeNumToScroll();
    // ftscroller must be required only on the client, as it accesses window.document on require
    const Scroller = require('ftscroller').FTScroller; // eslint-disable-line global-require
    const { scroller: scrollerElement } = this.refs;
    const { children, gutter, scrollerOptions, vertical, visibleItems, width } = this.props;
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
    }
    this.setState({ // eslint-disable-line react/no-did-mount-set-state
      listElementDimension,
      listDimension: listElementDimension * children.length,
    }, () => {
      this.scroller = new Scroller(
        scrollerElement,
        Object.assign({}, scrollerOptions, { scrollingY: vertical, scrollingX: !vertical })
      );
      if (typeof this.props.onScrollerCreated === 'function') {
        this.props.onScrollerCreated(this.scroller);
      }
      this.scroller.addEventListener('scrollstart', this.forceScrollUp);
      this.scroller.addEventListener('scrollend', this.forceScrollDown);
      window.addEventListener('resize', this.makeDebouncedDimensionslUpdateFunction);
    });
  }

  componentWillUnmount() {
    this.scroller.removeEventListener('scrollstart', this.forceScrollUp);
    this.scroller.removeEventListener('scrollend', this.forceScrollDown);
    window.removeEventListener('resize', this.debouncedDimensionsUpdateFunction);
  }

  makeDebouncedDimensionslUpdateFunction() {
    this.computeNumToScroll();
    this.debouncedDimensionsUpdateFunction = debounce(() => {
      const { scroller: scrollerElement } = this.refs;
      const { children, gutter, vertical, visibleItems } = this.props;
      const newListElementDimension = this.computeDimensions(
        scrollerElement,
        visibleItems,
        gutter,
        vertical
      );
      if (newListElementDimension) {
        const newListDimension = newListElementDimension * children.length;
        this.scroller.updateDimensions(newListDimension - gutter, scrollerElement.offsetHeight);
        this.setState({
          listElementDimension: newListElementDimension,
          listDimension: newListDimension,
        });
      }
    }, this.debounceWait);
    this.scrollWidth = this.props.width * this.numOfItemsToScrollBy;
    return this.debouncedDimensionsUpdateFunction;
  }

  computeDimensions(scrollerElement, visibleItems, gutter, vertical) {
    if (scrollerElement.offsetHeight === 0 || scrollerElement.offsetWidth === 0) {
      return null;
    }
    return vertical ?
      (scrollerElement.offsetHeight + gutter) / visibleItems :
      (scrollerElement.offsetWidth + gutter) / visibleItems;
  }

  forceScrollUp() {
    if (this.props.onScrollCallbackUp) {
      this.props.onScrollCallbackUp();
    }
  }
  forceScrollDown() {
    if (this.props.onScrollCallbackDown) {
      this.props.onScrollCallbackDown();
    }
  }

  computeNumToScroll() {
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
    return (
      <div className="carousel">
        {
          previousButton &&
          <CarouselControl
            direction="previous"
            onClick={this.handlePreviousClick}
          >
            {previousButton}
          </CarouselControl>
        }
        <div className="carousel__wrapper" ref="scroller">
          <CarouselList
            dimension={this.state.listDimension}
            gutter={gutter}
            vertical={vertical}
          >
            {carouselItems}
          </CarouselList>
        </div>
        {
          nextButton &&
          <CarouselControl
            direction="next"
            onClick={this.handleNextClick}
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
  scrollerOptions: {
    scrollbars: false,
    updateOnWindowResize: true,
  },
  visibleItems: 4,
};

if (process.env.NODE_ENV !== 'production') {
  Carousel.propTypes = {
    children: React.PropTypes.arrayOf(React.PropTypes.node),
    nextButton: React.PropTypes.node,
    previousButton: React.PropTypes.node,
    gutter: React.PropTypes.number,
    onScrollerCreated: React.PropTypes.func,
    scrollerOptions: React.PropTypes.shape({
      alwaysScroll: React.PropTypes.bool,
      baseAlignments: React.PropTypes.shape({
        x: React.PropTypes.number,
        y: React.PropTypes.number,
      }),
      bouncing: React.PropTypes.bool,
      contentWidth: React.PropTypes.number,
      contentHeight: React.PropTypes.number,
      disabledInputMethods: React.PropTypes.shape({
        mouse: React.PropTypes.bool,
        touch: React.PropTypes.bool,
        scroll: React.PropTypes.bool,
        pointer: React.PropTypes.bool,
        focus: React.PropTypes.bool,
      }),
      enableRequestAnimationFrameSupport: React.PropTypes.bool,
      flinging: React.PropTypes.bool,
      hwAccelerationClass: React.PropTypes.string,
      maxFlingDuration: React.PropTypes.number,
      scrollbars: React.PropTypes.bool,
      scrollBoundary: React.PropTypes.number,
      scrollingClassName: React.PropTypes.string,
      scrollResponseBoundary: React.PropTypes.number,
      scrollingX: React.PropTypes.bool,
      scrollingY: React.PropTypes.bool,
      singlePageScrolls: React.PropTypes.bool,
      snapping: React.PropTypes.bool,
      snapSizeX: React.PropTypes.number,
      snapSizeY: React.PropTypes.number,
      updateOnChanges: React.PropTypes.bool,
      updateOnWindowResize: React.PropTypes.bool,
      windowScrollingActiveFlag: React.PropTypes.string,
      flingBezier: React.PropTypes.string,
      bounceDecelerationBezier: React.PropTypes.string,
      bounceBezier: React.PropTypes.string,
      invertScrollWheel: React.PropTypes.bool,
    }),
    vertical: React.PropTypes.bool,
    visibleItems: React.PropTypes.number,
    width: React.PropTypes.number,
    onScrollCallbackUp: React.PropTypes.func,
    onScrollCallbackDown: React.PropTypes.func,
  };
}
