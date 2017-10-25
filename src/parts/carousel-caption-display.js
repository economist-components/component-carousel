import React from 'react';
import PropTypes from 'prop-types';

export default function CarouselCaptionDisplay({ classNamePrefix = 'carousel', caption = '' }) {
  return (<span className={`${ classNamePrefix }__caption`}>{caption}</span>);
}

if (process.env.NODE_ENV !== 'production') {
  CarouselCaptionDisplay.propTypes = {
    classNamePrefix: PropTypes.string,
    caption: PropTypes.string,
  };
}
