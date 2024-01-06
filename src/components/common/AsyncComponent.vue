<template>
	<component @vue:mounted="emit('ready')" v-if="comp" :is="comp" v-bind="props.data">
		<div v-if="props.html" v-html="props.html"></div>
	</component>
</template>

<script lang="ts" setup>
	import {computed, defineAsyncComponent} from "vue";
	
	const props = defineProps<{
		component: string,
		data?: {},
		html?:string
	}>();
	
	const emit = defineEmits(['ready']);
	
	const comp = computed(() => {
		// noinspection TypeScriptCheckImport
		return defineAsyncComponent(() => import(`./../${props.component}`).catch((e)=>{
			console.warn(`[AsyncComponent] Component "${props.component}" wasn't found`);
			return undefined;
		}));
	});

</script>
