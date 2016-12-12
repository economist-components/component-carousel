import React from 'react';

export default function CarouselCreditDisplay({  classNamePrefix = 'carousel', credit = '' }){
  return (<span className={`${ classNamePrefix }__credits`}>{credit}</span>);
}

if (process.env.NODE_ENV !== 'production') {
  CarouselCreditDisplay.propTypes = {
    credit: React.PropTypes.string,
  };
}
