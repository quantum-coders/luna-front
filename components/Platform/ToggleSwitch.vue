<template>
	<label
		:for="`button-${ id }`"
		:class="{'is-active': modelValue, 'is-disabled': disabled, 'logic-inverted': invertLogic}"
		class="toggle-button"
	>
		<input
			type="checkbox"
			:disabled="disabled"
			:id="`button-${ id }`"
			:checked="!!modelValue"
			@input="toggleValue"
		>
		<slot name="preSwitch" :state="modelValue"></slot>
		<span class="toggle-switch" />
		<slot name="postSwitch" :state="modelValue"></slot>
	</label>
</template>

<script setup>
	import { v4 as uuidv4 } from 'uuid';

	const emit = defineEmits([ 'update', 'input', 'update:modelValue' ]);

	// generate a random id
	const id = uuidv4();

	const props = defineProps({
		modelValue: {
			type: [ String, Boolean, Number ],
			default: false,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		invertLogic: {
			type: Boolean,
			default: false,
		},
	});

	const toggleValue = (event) => {
		console.log('Toggle Switch', event.target.checked);
		emit('update', event.target.checked);
		emit('input', event.target.checked);
		emit('update:modelValue', event.target.checked);
	};
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style scoped lang="sass">
	.toggle-button
		vertical-align: middle
		user-select: none
		cursor: pointer

		&[disabled],
		&.is-disabled
			opacity: 0.5

	input[type="checkbox"]
		opacity: 0
		position: absolute
		width: 1px
		height: 1px

	.toggle-button
		.toggle-switch
			display: inline-block
			height: 1em
			border-radius: 1em
			width: 2em
			min-width: 2em
			background: var(--bs-dark-bg-subtle)
			box-shadow: inset 0 0 1px var(--bs-dark-bg-subtle)
			position: relative
			transition: all .25s

			&:before
				content: ''
				position: absolute
				display: block
				height: calc(1em - 4px)
				width: calc(1em - 4px)
				border-radius: 50%
				left: 2px
				top: 2px
				transform: translateX(0)
				transition: all .25s
				background: var(--bs-light-bg-subtle)

		// has checked checkbox
		&:has(input[type="checkbox"]:checked):not(.logic-inverted),
		.is-active:not(.logic-inverted)
			.toggle-switch
				background: lighten($success, 40%)
				box-shadow: inset 0 0 1px lighten($success, 40%)

		&:has(input[type="checkbox"]:checked):not(.logic-inverted) .toggle-switch:before,
		.is-active:not(.logic-inverted) .toggle-switch:before
			transform: translateX(calc(1.5em + 2px))

		&:has(input[type="checkbox"]:checked):not(.logic-inverted),
		.is-active
			.toggle-switch
				&:before
					left: -9px
					background: $success
					box-shadow: 0 0 1px $success

		// has checked checkbox and inverted logic
		&:not(:has(input[type="checkbox"]:checked)):is(.logic-inverted),
		.is-active:not(.logic-inverted)
			.toggle-switch
				background: lighten($success, 40%)
				box-shadow: inset 0 0 1px lighten($success, 40%)

		&:not(:has(input[type="checkbox"]:checked)):is(.logic-inverted) .toggle-switch:before,
		.is-active:not(.logic-inverted) .toggle-switch:before
			transform: translateX(calc(1.5em + 2px))

		&:not(:has(input[type="checkbox"]:checked)):is(.logic-inverted),
		.is-active
			.toggle-switch
				&:before
					left: -9px
					background: $success
					box-shadow: 0 0 1px $success

</style>