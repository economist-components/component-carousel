import 'babel-polyfill';
import Carousel from '../src';
import { horizontalNodes } from '../src/example';
import React from 'react';
import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import spies from 'chai-spies';
import { mount } from 'enzyme';
chai.use(chaiEnzyme()).use(spies).should();
describe('Carousel', () => {

  it('renders a React element', () => {
    React.isValidElement(<Carousel />).should.equal(true);
  });

  describe('Rendering', () => {
    let rendered = null;
    let carousel = null;
    beforeEach(() => {
      rendered = mount(
        <Carousel
          nextButton={<span>▶</span>}
          previousButton={<span>◀</span>}
          gutter={22.5}
          visibleItems={4}
        >
          {horizontalNodes}
        </Carousel>
      );
      carousel = rendered.find('.carousel');
    });

    it('renders a top level div.carousel', () => {
      carousel.should.have.tagName('div');
      carousel.should.have.className('carousel');
    });

    it('renders correctly the list of elements', () => {
      carousel.should.have.exactly(1).descendants('.carousel__list');
      carousel.find('.carousel__list').should.have.exactly(5).descendants('.carousel__item');
      carousel.should.have.exactly(1).descendants('.carousel__control--next');
      carousel.should.have.exactly(1).descendants('.carousel__control--previous');
    });

    it('computes the correct dimensions', () => {
      const carouselList = carousel.find('.carousel__list');
      carouselList.children().forEach((carouselItem) => {
        carouselItem.should.have.style('paddingRight', '11.25px');
        carouselItem.should.have.style('paddingLeft', '11.25px');
      });
      carouselList.should.have.style('width', '28.125px');
      carouselList.should.have.style('marginLeft', '-11.25px');
      carouselList.should.have.style('marginRight', '-11.25px');
      carouselList.children().forEach((carouselItem) => {
        carouselItem.should.have.style('width', '5.625px');
      });
    });

    it('displays the correct controls', () => {
      const controlNext = carousel.find('.carousel__control--next');
      const controlPrevious = carousel.find('.carousel__control--previous');
      controlNext.find('span').should.have.text('▶');
      controlPrevious.find('span').should.have.text('◀');
    });

    it('responds correctly to nextButton click', () => {
      const spiedHandleNextClick = chai.spy(rendered.instance().handleNextClick);
      rendered.instance().handleNextClick = spiedHandleNextClick;
      carousel.find('.carousel__control--next').simulate('click');
      spiedHandleNextClick.should.have.been.called.exactly(1);
    });

    it('responds correctly to previousButton click', () => {
      const spiedHandlePreviousClick = chai.spy(rendered.instance().handlePreviousClick);
      rendered.instance().handlePreviousClick = spiedHandlePreviousClick;
      carousel.find('.carousel__control--previous').simulate('click');
      spiedHandlePreviousClick.should.have.been.called.exactly(1);
    });
  });

});
