import React from 'react';

export default function CarouselCounter({ currentSegment, totalSegment, separator = ' of ', classNamePrefix = 'carousel' }) {

  return (
    <div className={`${ classNamePrefix }__counter`}>
      <span className={`${ classNamePrefix }__counter-current-segment`}>{currentSegment}</span>
      {separator}
      <span className={`${ classNamePrefix }__counter-current-segment`}>{totalSegment}</span>
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  CarouselCounter.propTypes = {
    currentSegment: React.PropTypes.number,
    totalSegment: React.PropTypes.number,
    separator: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.node,
    ]),
    classNamePrefix: React.PropTypes.string,
  };
}
