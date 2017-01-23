import React from 'react';

export default function CarouselCreditDisplay({
  classNamePrefix = 'carousel',
  credit = '',
  hideEmpty = false,
  style = null,
}) {
  return hideEmpty && credit === '' ? null : (
    <div className={`${ classNamePrefix }__credits-wrapper`} style={style}>
      <span className={`${ classNamePrefix }__credits`}>{credit}</span>
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  CarouselCreditDisplay.propTypes = {
    classNamePrefix: React.PropTypes.string,
    credit: React.PropTypes.string,
    hideEmpty: React.PropTypes.bool,
    style: React.PropTypes.objectOf(React.PropTypes.string),
  };
}
