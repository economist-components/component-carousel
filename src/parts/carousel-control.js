import React from 'react';

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
    children: React.PropTypes.node,
    style: React.PropTypes.shape({
      display: React.PropTypes.string,
    }),
    onClick: React.PropTypes.func.isRequired,
    onKeyDown: React.PropTypes.func,
    direction: React.PropTypes.oneOf([ 'previous', 'next' ]),
  };
}
