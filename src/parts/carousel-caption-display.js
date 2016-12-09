import React from 'react';

export default function CarouselCaptionDisplay({ caption = '' }){
  return (<span>{caption}</span>);
}

if (process.env.NODE_ENV !== 'production') {
  CarouselCaptionDisplay.propTypes = {
    caption: React.PropTypes.string,
  };
}
