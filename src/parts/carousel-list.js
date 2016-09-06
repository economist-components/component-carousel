import React from 'react';

export default function CarouselList({ children, dimension, gutter, vertical }) {
  const size = dimension ? `${ dimension }px` : null;
  const style = {};
  if (vertical) {
    style.height = size;
    style.marginTop = `${ -gutter / 2 }px`;
    style.marginBottom = `${ -gutter / 2 }px`;
  } else {
    style.width = size;
    style.marginLeft = `${ -gutter / 2 }px`;
    style.marginRight = `${ -gutter / 2 }px`;
  }
  return (
    <ul className={`carousel__list${ vertical ? ' --vertical' : '' }`} style={style}>
      {children}
    </ul>
  );
}

if (process.env.NODE_ENV !== 'production') {
  CarouselList.propTypes = {
    children: React.PropTypes.node,
    dimension: React.PropTypes.number,
    gutter: React.PropTypes.number,
    vertical: React.PropTypes.bool,
  };
}
