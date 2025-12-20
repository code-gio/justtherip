<script lang="ts">
    import AuthFooter from "$lib/components/auth/auth-footer.svelte";
import AuthHeader from "$lib/components/auth/auth-header.svelte";

	const { children } = $props();
</script>

<div class="h-full flex flex-col justify-between ">
	<AuthHeader />
	<div class="flex-1 flex flex-col justify-center items-center my-6 ">
		{@render children()}
	</div>
	<AuthFooter />
</div>