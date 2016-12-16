import React from 'react';

export default function CarouselCaptionDisplay({ classNamePrefix = 'carousel', caption = '' }) {
  return (<span className={`${ classNamePrefix }__caption`}>{caption}</span>);
}

if (process.env.NODE_ENV !== 'production') {
  CarouselCaptionDisplay.propTypes = {
    classNamePrefix: React.PropTypes.string,
    caption: React.PropTypes.string,
  };
}
