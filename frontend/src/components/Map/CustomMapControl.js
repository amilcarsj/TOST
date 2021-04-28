/*global google*/
import React, { Component } from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
import { MAP } from 'react-google-maps/lib/constants';

// https://github.com/tomchentw/react-google-maps/issues/310#issuecomment-321351641
// Only way to implement control with the lib we are using
export class CustomMapControl extends Component {
	static contextTypes = {
		[MAP]: PropTypes.object
	}

	static propTypes = {
		controlPosition: PropTypes.number
	}

	static defaultProps = {
		controlPosition: google.maps.ControlPosition.TOP_LEFT
	}

	componentDidMount() {
		this.map = this.context[MAP];
		this._render();
	}

	componentDidUpdate() {
		this._render();
	}

	componentWillUnmount() {
		const {controlPosition} = this.props;
		const index = this.map.controls[controlPosition].getArray().indexOf(this.el);
		this.map.controls[controlPosition].removeAt(index);
	}
	_render() {
		const {controlPosition, children} = this.props;

		render(
			<div ref={el => {
				if (!this.renderedOnce) {
					this.el = el;
					this.map.controls[controlPosition].push(el);
				} else if (el && this.el && el !== this.el) {
					this.el.innerHTML = '';
					[].slice.call(el.childNodes).forEach(child => this.el.appendChild(child));
				}
				this.renderedOnce = true;
			}}>
				{children}
			</div>,
			document.createElement('div')
		);
	}

	render() {
		return <noscript />;
	}
}
