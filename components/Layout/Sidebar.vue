<template>
	<aside class="general-sidebar">
		<ul class="list-unstyled">
			<li>
				<nuxt-link class="icon-option" @click="chatHome" exact-active-class="selected">
					<icon class="sidebar-icon" name="gala:chat"/>
					<span>Luna AI</span>
				</nuxt-link>
			</li>
			<li>
				<nuxt-link to="/blink-editor" exact-active-class="selected">
					<icon class="sidebar-icon" name="gala:editor"/>
					<span>Blinks Editor</span>
				</nuxt-link>
			</li>
			<li>
				<nuxt-link to="/blinks/me" exact-active-class="selected">
					<icon class="sidebar-icon" name="gala:portrait1"/>
					<span>My Blinks</span>
				</nuxt-link>
			</li>
		</ul>
		<div class="chat-list-wrapper pretty-scrolls">
			<chat-list/>
		</div>
	</aside>
</template>

<script setup>
	const router = useRouter();
	const chat = useChatStore();
	const chatHome = () => {
		chat.cleanChatData();
		router.push('/');
	};
</script>

<style lang="sass" scoped>
	.icon-option
		cursor: pointer
	.chat-list-wrapper
		overflow-y: auto
		height: 75vh

		&::-webkit-scrollbar
			display: none

	.general-sidebar
		max-width: 250px
		min-width: 150px
		background: var(--bs-light-bg-subtle)
		display: none
		overflow-y: auto

		[data-bs-theme="dark"] &
			background: var(--bs-dark-bg-subtle)

		@media (min-width: $sm)
			display: block

		ul
			width: 100%
			padding: 0
			margin: 0

			li
				display: flex
				align-items: center
				padding: 10px 20px
				font-size: 1.18rem

				a
					display: flex
					align-items: center
					width: 100%
					color: var(--bs-body-color)
					text-decoration: none

					.sidebar-icon
						margin-right: 25px
						font-size: 1.5rem

					span
						white-space: nowrap

					&.selected
						color: var(--bs-primary)

					&:hover
						color: var(--bs-primary)
</style>
