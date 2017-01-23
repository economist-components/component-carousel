import React from 'react';

export default function CarouselCaptionDisplay({
  classNamePrefix = 'carousel',
  caption = '',
  style = null,
}) {
  return (
    <span
      className={`${ classNamePrefix }__caption`}
      style={style}
    >
      {caption}
    </span>
  );
}

if (process.env.NODE_ENV !== 'production') {
  CarouselCaptionDisplay.propTypes = {
    classNamePrefix: React.PropTypes.string,
    caption: React.PropTypes.string,
    style: React.PropTypes.objectOf(React.PropTypes.string),
  };
}
