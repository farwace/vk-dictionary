import type {DirectiveBinding, VNode} from "vue";
/** @ts-ignore */
import Hammer from 'hammerjs';
/** @ts-ignore */
import HammerInput from 'hammerjs';

declare global {
	interface HTMLElement {
		swipeBackEvent?: (event:HammerInput) => void,
		swipeForwardEvent?:(event:HammerInput) => void,
		hammerTime: {destroy: ()=>void}
	}
}

export const SwipeBack = {
	mounted: (el: HTMLElement, binding: DirectiveBinding, vnode: VNode) => {
		el.swipeBackEvent = function (event:HammerInput) {
			if(binding.value.onSwipeBack){
				binding.value.onSwipeBack(event, el);
			}
		}
		el.swipeForwardEvent = function (event:HammerInput) {
			if(binding.value.onSwipeForward){
				binding.value.onSwipeForward(event, el);
			}
		}

		if(Hammer.defaults.cssProps.userSelect){
			delete Hammer.defaults.cssProps.userSelect;
		}

		const hammerTime = new Hammer(el, {
			domEvents: true
		});

		hammerTime.on('swipe', (swipeEvent:HammerInput) => {

			const target:HTMLElement = swipeEvent.target;
			if(target.closest('.swiper')){
				return;
			}

			if(swipeEvent.direction === 4 && swipeEvent.distance > 80){
				if(el.swipeBackEvent){
					el.swipeBackEvent(swipeEvent);
				}
			}
			if(swipeEvent.direction == 2 && swipeEvent.distance > 80){
				if(el.swipeForwardEvent){
					el.swipeForwardEvent(swipeEvent);
				}
			}
		});
		el.hammerTime = hammerTime;
	},
	beforeUnmount: (el:HTMLElement) => {
		if(el.hammerTime){
			el.hammerTime.destroy();
		}
	}
}
