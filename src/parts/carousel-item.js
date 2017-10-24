import React from 'react';
import PropTypes from 'prop-types';

export default function CarouselItem({ children, dimension, gutter, vertical }) {
  const size = dimension ? `${ dimension }px` : null;
  const style = {};
  if (vertical) {
    style.paddingTop = `${ gutter / 2 }px`;
    style.paddingBottom = `${ gutter / 2 }px`;
    style.height = size;
  } else {
    style.paddingRight = `${ gutter / 2 }px`;
    style.paddingLeft = `${ gutter / 2 }px`;
    style.width = size;
  }
  return (
    <li className={`carousel__item${ vertical ? '--vertical' : '' }`} style={style}>
      {children}
    </li>
  );
}


if (process.env.NODE_ENV !== 'production') {
  CarouselItem.propTypes = {
    dimension: PropTypes.number,
    gutter: PropTypes.number,
    children: PropTypes.node,
    vertical: PropTypes.bool,
  };
}
