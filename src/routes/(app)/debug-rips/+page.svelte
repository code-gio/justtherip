<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";

  let { data } = $props();
</script>

<div class="max-w-4xl mx-auto p-6 space-y-6">
  <Card.Root>
    <Card.Header>
      <Card.Title>Rips System Diagnostics</Card.Title>
      <Card.Description>
        Checking if your database is set up correctly
      </Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div>
        <p class="text-sm text-muted-foreground">User ID: {data.userId}</p>
        <p class="text-sm text-muted-foreground">Email: {data.email}</p>
      </div>

      <!-- Test 1: rip_balances table -->
      <div class="border rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold">1. rip_balances Table</h3>
          {#if data.tests.rip_balances?.exists}
            <Badge variant="default">✓ Exists</Badge>
          {:else}
            <Badge variant="destructive">✗ Missing</Badge>
          {/if}
        </div>
        <p class="text-sm text-muted-foreground mb-2">
          Stores user Rip balances
        </p>
        {#if data.tests.rip_balances?.hasUserRecord}
          <Badge variant="secondary">Has your balance record</Badge>
          <pre class="mt-2 p-2 bg-muted rounded text-xs overflow-auto">{JSON.stringify(
              data.tests.rip_balances.data,
              null,
              2
            )}</pre>
        {:else}
          <Badge variant="outline">No balance record for you yet</Badge>
        {/if}
        {#if data.tests.rip_balances?.error}
          <p class="text-sm text-destructive mt-2">
            Error: {data.tests.rip_balances.error}
          </p>
        {/if}
      </div>

      <!-- Test 2: rip_bundles table -->
      <div class="border rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold">2. rip_bundles Table</h3>
          {#if data.tests.rip_bundles?.exists}
            <Badge variant="default">✓ Exists</Badge>
          {:else}
            <Badge variant="destructive">✗ Missing</Badge>
          {/if}
        </div>
        <p class="text-sm text-muted-foreground mb-2">
          Stores available Rip bundles for purchase
        </p>
        {#if data.tests.rip_bundles?.count > 0}
          <Badge variant="secondary"
            >{data.tests.rip_bundles.count} bundles available</Badge
          >
        {:else}
          <Badge variant="outline">No bundles found (need to seed data)</Badge>
        {/if}
        {#if data.tests.rip_bundles?.error}
          <p class="text-sm text-destructive mt-2">
            Error: {data.tests.rip_bundles.error}
          </p>
        {/if}
      </div>

      <!-- Test 3: get_user_rip_balance function -->
      <div class="border rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold">3. get_user_rip_balance() Function</h3>
          {#if data.tests.get_user_rip_balance_function?.exists}
            <Badge variant="default">✓ Exists</Badge>
          {:else}
            <Badge variant="destructive">✗ Missing</Badge>
          {/if}
        </div>
        <p class="text-sm text-muted-foreground mb-2">
          Database function to retrieve balance
        </p>
        {#if data.tests.get_user_rip_balance_function?.result !== undefined}
          <Badge variant="secondary"
            >Your balance: {data.tests.get_user_rip_balance_function
              .result} Rips</Badge
          >
        {/if}
        {#if data.tests.get_user_rip_balance_function?.error}
          <p class="text-sm text-destructive mt-2">
            Error: {data.tests.get_user_rip_balance_function.error}
          </p>
        {/if}
      </div>

      <!-- Test 4: RLS Check -->
      <div class="border rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold">4. Row Level Security (RLS)</h3>
          {#if data.tests.rls_check?.canReadAllRecords}
            <Badge variant="default">✓ Working</Badge>
          {:else}
            <Badge variant="destructive">✗ Issue</Badge>
          {/if}
        </div>
        <p class="text-sm text-muted-foreground mb-2">
          Service role can bypass RLS
        </p>
        {#if data.tests.rls_check?.recordCount !== undefined}
          <Badge variant="secondary"
            >Total balance records: {data.tests.rls_check.recordCount}</Badge
          >
        {/if}
        {#if data.tests.rls_check?.error}
          <p class="text-sm text-destructive mt-2">
            Error: {data.tests.rls_check.error}
          </p>
        {/if}
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Summary -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Summary & Next Steps</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-4">
      {#if !data.tests.rip_balances?.exists || !data.tests.rip_bundles?.exists || !data.tests.get_user_rip_balance_function?.exists}
        <div class="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <h4 class="font-semibold text-destructive mb-2">
            ⚠️ Database Not Set Up
          </h4>
          <p class="text-sm mb-4">
            Your database tables and functions are missing. You need to run the
            SQL setup script.
          </p>
          <ol class="text-sm space-y-2 list-decimal list-inside">
            <li>
              Open your Supabase project: <a
                href="https://supabase.com/dashboard/project/vbfxxglxntghnyparajl/editor"
                target="_blank"
                class="text-primary underline">SQL Editor</a
              >
            </li>
            <li>
              Copy the SQL from <code class="bg-muted px-1 rounded"
                >QUICKSTART.md</code
              >
            </li>
            <li>Paste and run it in the SQL Editor</li>
            <li>Refresh this page to verify</li>
          </ol>
        </div>
      {:else if data.tests.rip_bundles?.count === 0}
        <div class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <h4 class="font-semibold text-amber-600 dark:text-amber-500 mb-2">
            ⚠️ No Bundles Found
          </h4>
          <p class="text-sm">
            Tables exist but no bundles. Make sure you ran the INSERT statements
            in the SQL script.
          </p>
        </div>
      {:else}
        <div class="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <h4 class="font-semibold text-primary mb-2">✅ All Systems Ready!</h4>
          <p class="text-sm mb-4">
            Your database is set up correctly. You can start using Rips!
          </p>
          <div class="flex gap-2">
            <Button href="/wallet">Go to Wallet</Button>
            <Button href="/packs" variant="outline">Open Packs</Button>
          </div>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Raw Data -->
  <details class="border rounded-lg p-4">
    <summary class="cursor-pointer font-semibold">
      View Raw Diagnostic Data
    </summary>
    <pre
      class="mt-4 p-4 bg-muted rounded text-xs overflow-auto">{JSON.stringify(
        {
          userId: data.userId,
          email: data.email,
          tests: data.tests,
          generalError: data.generalError
        },
        null,
        2
      )}</pre>
  </details>
</div>
