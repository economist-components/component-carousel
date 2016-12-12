import 'babel-polyfill';
import React from 'react';
import Carousel from './';
import CarouselStateManager from './parts/carousel-state-manager';
import CarouselCounter from './parts/carousel-counter';
import CarouselCaptionDisplay from './parts/carousel-caption-display';
import CarouselCreditDisplay from './parts/carousel-credit-display';

export const horizontalNodes = ([
  <div className="example-node" key="0" data-caption="This i the caption 1" data-credit="Credit for 1">
    <div className="example-node__image" />
    <h3 className="example-node__title">Work for us: Nico Colchester journalism fellowshiphs</h3>
    <h4 className="example-node__subtitle">Europe | 1 hour 44 mins ago</h4>
  </div>,
  <div className="example-node" key="1" data-caption="This i the caption 2" data-credit="Credit for 2">
    <div className="example-node__image" />
    <h3 className="example-node__title">The Economist explains: What happened in the Thirty Years Wat?</h3>
    <h4 className="example-node__subtitle">The Economist explains | 1 day ago</h4>
  </div>,
  <div className="example-node" key="2" data-caption="This i the caption 3" data-credit="Credit for 3">
    <div className="example-node__image" />
    <h3 className="example-node__title">
      Unions and the Supreme Court: The justice seems poised to deliver a blow to public-sector unions
    </h3>
    <h4 className="example-node__subtitle">The Economist explains | 2 days ago</h4>
  </div>,
  <div className="example-node" key="3" data-caption="This i the caption 4" data-credit="Credit for 4">
    <div className="example-node__image" />
    <h3 className="example-node__title">
      Catalonian independence: Catalonia's new president is even more secessionist than the last
    </h3>
    <h4 className="example-node__subtitle">Europe | 2 days ago</h4>
  </div>,
  <div className="example-node" key="4" data-caption="This i the caption 5" data-credit="Credit for 5">
    <div className="example-node__image" />
    <h3 className="example-node__title">Work for us: Nico Colchester journalism fellowshiphs</h3>
    <h4 className="example-node__subtitle">Europe | 1 hour 44 mins ago</h4>
  </div>,
]);

export const verticalNodes = [
  <div className="example-node--vertical" key="0">
    <div className="example-node__image" />
    <h3 className="example-node__title">Work for us: Nico Colchester journalism fellowshiphs</h3>
    <h4 className="example-node__subtitle">Europe | 1 hour 44 mins ago</h4>
  </div>,
  <div className="example-node--vertical" key="1">
    <div className="example-node__image" />
    <h3 className="example-node__title">The Economist explains: What happened in the Thirty Years Wat?</h3>
    <h4 className="example-node__subtitle">The Economist explains | 1 day ago</h4>
  </div>,
  <div className="example-node--vertical" key="2">
    <div className="example-node__image" />
    <h3 className="example-node__title">
      Unions and the Supreme Court: The justice seems poised to deliver a blow to public-sector unions
    </h3>
    <h4 className="example-node__subtitle">The Economist explains | 2 days ago</h4>
  </div>,
  <div className="example-node--vertical" key="3">
    <div className="example-node__image" />
    <h3 className="example-node__title">
      Catalonian independence: Catalonia's new president is even more secessionist than the last
    </h3>
    <h4 className="example-node__subtitle">Europe | 2 days ago</h4>
  </div>,
  <div className="example-node--vertical" key="4">
    <div className="example-node__image" />
    <h3 className="example-node__title">Work for us: Nico Colchester journalism fellowshiphs</h3>
    <h4 className="example-node__subtitle">Europe | 1 hour 44 mins ago</h4>
  </div>,
];

export default (
  <div>
    <div style={{ 'maxWidth': '1308px', margin: '0 auto' }}>
      <CarouselStateManager>
        <Carousel
          nextButton={<span>▶</span>}
          previousButton={<span>◀</span>}
          gutter={22.5}
          visibleItems={1}
        >
          {horizontalNodes}
        </Carousel>
        <CarouselCaptionDisplay />
        <CarouselCreditDisplay />
        <CarouselCounter separator=" / " />
      </CarouselStateManager>
    </div>
    <div style={{ 'maxWidth': '1308px', margin: '0 auto' }}>
      <Carousel
        nextButton={<span>▶</span>}
        previousButton={<span>◀</span>}
        gutter={22.5}
        visibleItems={4}
      >
        {horizontalNodes}
      </Carousel>
    </div>
    <div style={{ 'height': '800px', width: '300px', margin: '0 auto' }}>
      <Carousel
        vertical
        nextButton={<span>▼</span>}
        previousButton={<span>▲</span>}
        gutter={22.5}
        visibleItems={3}
      >
        {verticalNodes}
      </Carousel>
    </div>
  </div>
);
