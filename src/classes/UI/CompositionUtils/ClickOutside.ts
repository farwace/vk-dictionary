import type {DirectiveBinding, VNode} from "vue";

declare global {
	interface HTMLElement {
		clickOutsideEvent?: (event:Event) => void
	}
}

export const ClickOutside = {
	mounted: (el: HTMLElement, binding: DirectiveBinding, vnode: VNode) => {
		el.clickOutsideEvent = function (event:Event) {
			if(event.target){
				if (!(el == event.target || el.contains(event.target as Node))) {
					binding.value(event, el);
				}
			}
		}
		
		document.addEventListener('click', el.clickOutsideEvent);
		
	},
	beforeUnmount: (el:HTMLElement) => {
		if(el.clickOutsideEvent){
			document.removeEventListener("click", el.clickOutsideEvent)
		}
	}
}
