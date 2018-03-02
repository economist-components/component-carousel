import React from 'react';
import PropTypes from 'prop-types';

export default function CarouselList({ children, dimension, gutter, vertical, style: styleProp }) {
  const size = dimension ? `${ dimension }px` : null;
  let style = {};
  if (vertical) {
    style.height = size;
    style.marginTop = `${ -gutter / 2 }px`;
    style.marginBottom = `${ -gutter / 2 }px`;
  } else {
    style.width = size;
    style.marginLeft = `${ -gutter / 2 }px`;
    style.marginRight = `${ -gutter / 2 }px`;
  }
  style = Object.assign(style, styleProp);

  return (
    <ul className={`carousel__list${ vertical ? ' --vertical' : '' }`} style={style}>
      {children}
    </ul>
  );
}

if (process.env.NODE_ENV !== 'production') {
  CarouselList.propTypes = {
    children: PropTypes.node,
    dimension: PropTypes.number,
    gutter: PropTypes.number,
    vertical: PropTypes.bool,
    style: PropTypes.shape({}),
  };
}
