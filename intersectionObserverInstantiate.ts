import LazyLoadClass from './intersectionObserverLazyLoadClass';

const base64logoJSON = require('./base64-logo.json');

const lazyLoadOptions = {
	instantiationHook: '[data-load="lazy"]',
	completeStateString: 'lazyLoadComplete',
	errorStateString: 'lazyLoadError',
	fallBackImageBase64: base64logoJSON.fallBackImageBase64,
	// the properties below are native to intersection observer
	root: null,
	rootMargin: '400px',
	delay: '0',
	threshold: '0',
	trackVisibility: false
};

window.addEventListener('load', () => {
	let InstanceOfLazyLoadClass = new LazyLoadClass();
	// can we get the class to invoke first function? or is this fine?
	InstanceOfLazyLoadClass.testForPresenceOfElementsToLazyLoad();
});
