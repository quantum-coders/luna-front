<template>
	<aside class="general-sidebar">
		<ul class="list-unstyled">
			<li>
				<nuxt-link to="/" exact-active-class="selected">
					<icon name="gala:chat" />
				</nuxt-link>
			</li>
			<li>
				<nuxt-link to="/blink-editor" exact-active-class="selected">
					<icon name="gala:editor" />
				</nuxt-link>
			</li>
		</ul>
	</aside>
</template>

<script setup>
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	.general-sidebar
		width: 60px
		min-width: 60px
		background: var(--bs-light-bg-subtle)
		display: none

		[data-bs-theme="dark"] &
			background: var(--bs-dark-bg-subtle)

		@media (min-width: $sm)
			display: block

		ul
			width: 100%

			li
				text-align: center
				font-size: 1.18rem

				a
					display: block
					padding: 1rem 0
					color: var(--bs-body-color)

					&.selected
						color: var(--bs-primary)

					&:hover
						color: var(--bs-primary)
</style>