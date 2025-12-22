<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { IconKey, IconShield } from "@tabler/icons-svelte";
</script>

<div class="space-y-6">
  <Card.Root>
    <Card.Header>
      <Card.Title class="flex items-center gap-2">
        <IconKey size={20} />
        Password
      </Card.Title>
      <Card.Description>
        Change your password to keep your account secure.
      </Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-sm font-medium">Password</p>
          <p class="text-xs text-muted-foreground">Last changed: Never</p>
        </div>
        <Button
          variant="outline"
          href="/reset-password/confirm"
          class="gap-2"
        >
          <IconKey size={16} />
          Change Password
        </Button>
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title class="flex items-center gap-2">
        <IconShield size={20} />
        Active Sessions
      </Card.Title>
      <Card.Description>
        Manage your active sessions across devices.
      </Card.Description>
    </Card.Header>
    <Card.Content>
      <div
        class="flex items-center justify-between p-3 rounded-lg bg-muted/50"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-full bg-primary/10">
            <IconShield size={20} class="text-primary" />
          </div>
          <div class="space-y-0.5">
            <p class="text-sm font-medium">Current Session</p>
            <p class="text-xs text-muted-foreground">
              This device · Active now
            </p>
          </div>
        </div>
        <Badge variant="secondary" class="gap-1">
          <span class="h-2 w-2 rounded-full bg-green-500"></span>
          Active
        </Badge>
      </div>
    </Card.Content>
  </Card.Root>
</div>

