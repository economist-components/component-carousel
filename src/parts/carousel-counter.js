import React from 'react';

export default function CarouselCounter({
  currentSegment,
  totalSegment,
  separator = ' of ',
  classNamePrefix = 'carousel',
  style = null,
}) {
  return (
    <div className={`${ classNamePrefix }__counter`} style={style}>
      <span className={`${ classNamePrefix }__counter-current-segment`}>{currentSegment}</span>
      {separator}
      <span className={`${ classNamePrefix }__counter-total-segment`}>{totalSegment}</span>
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
    style: React.PropTypes.objectOf(React.PropTypes.string),
  };
}
