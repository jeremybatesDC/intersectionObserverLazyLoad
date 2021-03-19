```typescript
export default class LazyLoadClass {
	lazyLoadOptions: any;
	lazyLoadOptionsGivenToConstructor: any;
	defaultOptions: any;
	intersectionObserverInstance: any;
	arrayOfElementsToLazyLoad: any;

	constructor(lazyLoadOptionsGivenToConstructor?) {
		this.defaultOptions = {
			instantiationHook: '[data-load="lazy"]',
			completeStateString: 'lazyLoadComplete',
			errorStateString: 'lazyLoadError',
			fallBackImageBase64: null,
			// the properties below are native to intersection observer
			root: null,
			rootMargin: '400px',
			delay: '0',
			threshold: '0',
			trackVisibility: false
		};
		lazyLoadOptionsGivenToConstructor
			? (this.lazyLoadOptions = lazyLoadOptionsGivenToConstructor)
			: (this.lazyLoadOptions = this.defaultOptions);
        // i want to just do an array FROM, but would need to polyfill for IE
		this.arrayOfElementsToLazyLoad = Array.prototype.slice.call(
			document.querySelectorAll(this.lazyLoadOptions.instantiationHook)
		);
	} //end of constructor

	testForPresenceOfElementsToLazyLoad(): void {
		if (this.arrayOfElementsToLazyLoad) this.testForIntersectionObserverSupport();
	}
	testForIntersectionObserverSupport(): void {
		window['IntersectionObserver'] ? this.initIntersectionObserverLazyLoad() : this.fallbackForOlderBrowsers();
	}
	// breaking up this init function proved too hard because intersection observer hijacks 'this'
	initIntersectionObserverLazyLoad(): void {
		this.intersectionObserverInstance = new IntersectionObserver((entries: any) => {
			let intersectingEntries = entries
				.filter(entry => entry.isIntersecting)
				.map(filteredEntry => this.lazyLoadTheElement(filteredEntry.target));
		}, this.lazyLoadOptions);

		this.arrayOfElementsToLazyLoad.map(elemToLazyLoad => {
			this.intersectionObserverInstance.observe(elemToLazyLoad);
			elemToLazyLoad.onerror = () => {
				this.failHandler(elemToLazyLoad);
			};
		});
	}
	lazyLoadTheElement(elem: HTMLElement): void {
		this.copyDataAttrToNativeAttr(elem);
		this.setCompleteState(elem);
		this.intersectionObserverInstance.unobserve(elem);
	}
	stashOriginalPlaceholderImageInNewAttr(elem: any, whatToStash: string): void {
		elem.dataset.originalPlaceholder = elem[whatToStash];
	}
	copyDataAttrToNativeAttr(elem: any): void {
		if (elem.dataset.src) {
			this.stashOriginalPlaceholderImageInNewAttr(elem, 'src');
			elem.src = elem.dataset.src;
		} else if (elem.dataset.srcset) {
			this.stashOriginalPlaceholderImageInNewAttr(elem, 'srcset');
			elem.srcset = elem.dataset.srcset;
		} else if (elem.dataset.style) {
			this.createStyleAttrOrAddToExisting(elem, elem.dataset.style);
		}
	}
	createStyleAttrOrAddToExisting(elem: HTMLElement, styleToAdd: any): void {
		elem.hasAttribute('style')
			? elem.setAttribute('style', `${styleToAdd};${elem.getAttribute('style')}`)
			: elem.setAttribute('style', elem.dataset.style);
	}
	setCompleteState(elem: HTMLElement): void {
		elem.dataset.lazyLoaded = this.lazyLoadOptions.completeStateString;
	}
	failHandler(elem: HTMLElement): void {
		elem.dataset.lazyLoaded = this.lazyLoadOptions.errorStateString;
		// reassigning error handler to ensure this only fires once because in dev there can be infinite loops
		elem.onerror = () => {};
		this.setFallbackImage(elem);
	}
	setFallbackImage(elem: any): void {
		elem.src = elem.dataset.originalPlaceholder;
		this.createStyleAttrOrAddToExisting(elem, `background-image: url(${this.lazyLoadOptions.fallBackImageBase64})`);
	}
	fallbackForOlderBrowsers(): void {
		console.log('Intersection Observer not supported');
		for (let elem of this.arrayOfElementsToLazyLoad) {
			this.copyDataAttrToNativeAttr(elem);
			this.setCompleteState(elem);
			// if IO observer not supported, broken image links wonT get backup image
		}
	}
}
```
