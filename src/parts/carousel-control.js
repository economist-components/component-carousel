import React from 'react';
import PropTypes from 'prop-types';

export default function CarouselControl({ children, style, direction, onClick, onKeyDown }) {
  return (
    <a className={`carousel__control carousel__control--${ direction }`}
      role="button"
      style={style}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      aria-label={`${ direction } button`}
    >
      {children}
    </a>
  );
}

if (process.env.NODE_ENV !== 'production') {
  CarouselControl.propTypes = {
    children: PropTypes.node,
    style: PropTypes.shape({
      display: PropTypes.string,
    }),
    onClick: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func,
    direction: PropTypes.oneOf([ 'previous', 'next' ]),
  };
}
