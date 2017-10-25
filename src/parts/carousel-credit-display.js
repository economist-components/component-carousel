import React from 'react';
import PropTypes from 'prop-types';

export default function CarouselCreditDisplay({
  classNamePrefix = 'carousel',
  credit = '',
  hideEmpty = false,
}) {
  return hideEmpty && credit === '' ? null : (
    <div className={`${ classNamePrefix }__credits-wrapper`}>
      <span className={`${ classNamePrefix }__credits`}>{credit}</span>
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  CarouselCreditDisplay.propTypes = {
    classNamePrefix: PropTypes.string,
    credit: PropTypes.string,
    hideEmpty: PropTypes.bool,
  };
}
