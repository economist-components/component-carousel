import React from 'react';
import PropTypes from 'prop-types';

export default function CarouselCounter({
  currentSegment,
  totalSegment,
  separator = ' of ',
  classNamePrefix = 'carousel',
}) {
  return (
    <div className={`${ classNamePrefix }__counter`}>
      <span className={`${ classNamePrefix }__counter-current-segment`}>{currentSegment}</span>
      {separator}
      <span className={`${ classNamePrefix }__counter-total-segment`}>{totalSegment}</span>
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  CarouselCounter.propTypes = {
    currentSegment: PropTypes.number,
    totalSegment: PropTypes.number,
    separator: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node,
    ]),
    classNamePrefix: PropTypes.string,
  };
}
