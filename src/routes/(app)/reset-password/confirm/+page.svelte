<script lang="ts">
  import NewPassword from "$lib/components/auth/new-password.svelte";
  import * as Card from "$lib/components/ui/card";
</script>

<Card.Root class="sm:w-[448px]">
  <Card.Header>
    <Card.Title class="text-center text-2xl">Reset password</Card.Title>
  </Card.Header>
  <Card.Content>
    <NewPassword></NewPassword>
  </Card.Content>
</Card.Root>
