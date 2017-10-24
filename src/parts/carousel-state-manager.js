import React from 'react';
import PropTypes from 'prop-types';
import Carousel from '../index';
import CarouselCounter from './carousel-counter';
import CarouselCaptionDisplay from './carousel-caption-display';
import CarouselCreditDisplay from './carousel-credit-display';

export default class CarouselStateManager extends React.Component {
  constructor(props) {
    super(props);
    this.handleSegmentChange = this.handleSegmentChange.bind(this);
    this.state = { currentSegment: 1, caption: '' };
  }
  componentWillMount() {
    const segments = this.props.children.filter((child) => child.type === Carousel)[0].props.children;
    this.totalSegment = segments.length;
    this.captions = segments.map((segment) => segment.props['data-caption']);
    this.credits = segments.map((segment) => segment.props['data-credit']);
    this.setState({
      caption: this.retrieveCaption(0),
      credit: this.retrieveCredit(0),
    });
  }
  retrieveCaption(index) {
    return (this.captions.length > 0) ? this.captions[index] : '';
  }
  retrieveCredit(index) {
    return (this.credits.length > 0) ? this.credits[index] : '';
  }
  handleSegmentChange({ segmentX }) {
    this.setState({
      currentSegment: segmentX + 1,
      caption: this.retrieveCaption(segmentX),
      credit: this.retrieveCredit(segmentX),
    });
  }
  render() {
    const children = [];
    this.props.children.forEach((child) => {
      let newChild = child;
      if (child.type === CarouselCounter) {
        newChild = React.cloneElement(child, Object.assign(
          {},
          child.props,
          {
            currentSegment: this.state.currentSegment,
            totalSegment: this.totalSegment,
            key: 'carousel-counter',
          }
        ));
      } else if (child.type === CarouselCaptionDisplay) {
        newChild = React.cloneElement(child, Object.assign(
          {},
          {
            caption: this.state.caption,
            key: 'carousel-caption-display',
          }
        ));
      } else if (child.type === CarouselCreditDisplay) {
        newChild = React.cloneElement(child, Object.assign(
          {},
          {
            credit: this.state.credit,
            key: 'carousel-credit-display',
          }
        ));
      } else if (child.type === Carousel) {
        newChild = React.cloneElement(child, Object.assign(
          {},
          child.props,
          {
            onScrollerSegmentdidchange: this.handleSegmentChange,
            key: 'Carousel',
          }
        ));
      } else {
        newChild = child;
      }
      children.push(newChild);
    });

    return (
      <div>
        {children}
      </div>
    );
  }
}

if (process.env.NODE_ENV !== 'production') {
  CarouselStateManager.propTypes = {
    children: PropTypes.node,
  };
}
