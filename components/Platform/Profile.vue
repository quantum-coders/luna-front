<template>
	<platform-avatar class="profile-style" :user="user" :size="size" />
</template>

<script setup>
	const props = defineProps({
		user: {
			type: Object,
			required: true,
		},
		size: {
			type: [ String, Number ],
			default: '',
		},
	});
</script>

<style scoped lang="sass">
	.profile-style
		cursor: pointer

		&:hover
			opacity: 0.8
			transition: opacity 0.2s
</style>
