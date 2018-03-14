import 'babel-polyfill';
import Carousel from '../src';
import CarouselControl from '../src/parts/carousel-control';
import CarouselList from '../src/parts/carousel-list';
import CarouselItem from '../src/parts/carousel-item';
import CarouselScroller from '../src/parts/carousel-scroller';
import { horizontalNodes } from '../src/example';
import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import spies from 'chai-spies';
import { mount } from 'enzyme';
Enzyme.configure({ adapter: new Adapter() });
chai.use(chaiEnzyme()).use(spies).should();
describe('Carousel', () => {

  it('renders a React element', () => {
    React.isValidElement(<Carousel />).should.equal(true);
  });

  describe('Rendering', () => {
    let mounted = null;
    beforeEach(() => {
      mounted = mount(
        <Carousel
          nextButton={<span>▶</span>}
          previousButton={<span>◀</span>}
          gutter={10}
          visibleItems={1}
          animated={false}
        >
          {horizontalNodes}
        </Carousel>
      );
      mounted.setState({ isInitialPosition: false, isFinalPosition: false });
    });

    afterEach(() => {
      mounted.unmount();
    });

    it('renders a top level div.carousel', () => {
      mounted.should.have.tagName('div');
      mounted.should.have.className('carousel');
    });

    it('renders correctly the list of elements', () => {
      mounted.should.have.exactly(1).descendants(CarouselList);
      mounted.find(CarouselList).should.have.exactly(5).descendants(CarouselItem);
      mounted.should.have.exactly(2).descendants(CarouselControl);
      mounted.should.have.exactly(1).descendants(CarouselScroller);
    });

    it('computes the correct padding and margin', () => {
      const carouselList = mounted.find(CarouselList);
      carouselList.find(CarouselItem).forEach((carouselItem) => {
        carouselItem.should.have.style('padding-right', '5px');
        carouselItem.should.have.style('padding-left', '5px');
      });
      carouselList.should.have.style('marginLeft', '-5px');
      carouselList.should.have.style('marginRight', '-5px');
    });

    it('displays the correct controls', () => {
      const controls = mounted.find(CarouselControl);
      const controlNext = controls.filter({ direction: 'next' });
      const controlPrevious = controls.filter({ direction: 'previous' });
      controlNext.should.not.have.style('display');
      controlPrevious.should.not.have.style('display');
      controlNext.find('span').should.have.text('▶');
      controlPrevious.find('span').should.have.text('◀');
    });

    it('dispatches onScrollStart and onScrollEnd after nextButton click', (done) => {
      const onScrollStart = chai.spy();
      function onScrollEnd() {
        onScrollStart.should.have.been.called.once;
        done();
      }
      mounted.setProps({ onScrollStart, onScrollEnd });
      mounted.find(CarouselControl).filter({ direction: 'next' }).simulate('click');
    });

    it('dispatches onScrollStart and onScrollEnd after previousButton click', (done) => {
      const onScrollStart = chai.spy();
      function onScrollEnd() {
        onScrollStart.should.have.been.called.once;
        done();
      }
      mounted.find(CarouselControl).filter({ direction: 'next' }).simulate('click');
      mounted.setProps({ onScrollStart, onScrollEnd });
      mounted.find(CarouselControl).filter({ direction: 'previous' }).simulate('click');
    });

    it('dispatches onSegmentChange when nextButton click changes segment', (done) => {
      function onSegmentChange(segment) {
        segment.should.be.equal(1);
        done();
      }
      mounted.setProps({ onSegmentChange });
      mounted.find(CarouselControl).filter({ direction: 'next' }).simulate('click');
    });

    it('dispatches onSegmentChange when previousButton click changes segment', (done) => {
      function onSegmentChange(segment) {
        segment.should.be.equal(1);
        done();
      }
      mounted.find(CarouselControl).filter({ direction: 'next' }).simulate('click');
      mounted.setProps({ onSegmentChange });
      mounted.find(CarouselControl).filter({ direction: 'previous' }).simulate('click');
    });

    it('hides previousButton when on start', () => {
      mounted.setState({ isInitialPosition: true });
      mounted.find('.carousel__control--previous').should.not.have.style('display');
    });

    it('hides nextButton when on end', () => {
      mounted.setState({ isFinalPosition: true });
      mounted.find('.carousel__control--next').should.not.have.style('display');
    });
  });

  describe('Rendering with hideArrowsOnEdges prop', () => {
    let mounted = null;
    beforeEach(() => {
      mounted = mount(
        <Carousel
          nextButton={<span>▶</span>}
          previousButton={<span>◀</span>}
          gutter={10}
          visibleItems={1}
          hideArrowsOnEdges
          animated={false}
        >
          {horizontalNodes}
        </Carousel>
      );
      mounted.setState({ isInitialPosition: false, isFinalPosition: false });
    });

    it('hides previousButton when on start', () => {
      mounted.setState({ isInitialPosition: true });
      mounted.find('.carousel__control--previous').should.have.style('display', 'none');
    });

    it('hides nextButton when on end', () => {
      mounted.setState({ isFinalPosition: true });
      mounted.find('.carousel__control--next').should.have.style('display', 'none');
    });
  });
});
