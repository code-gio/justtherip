import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table/index.js";
import DataTableActions from "./data-table-actions.svelte";
import type { UserWithStats } from "$lib/components/admin/users/types";

export const columns: ColumnDef<UserWithStats>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => {
      const user = row.original;
      const usernameSnippet = createRawSnippet<[{ user: UserWithStats }]>(
        (getUser) => {
          const { user } = getUser();
          const displayName = user.display_name || user.username;
          const avatarUrl = user.avatar_url;
          
          return {
            render: () => {
              if (avatarUrl) {
                return `
                  <div class="flex items-center gap-2">
                    <img src="${avatarUrl}" alt="${displayName}" class="size-8 rounded-full" />
                    <div>
                      <div class="font-medium">${displayName}</div>
                      <div class="text-sm text-muted-foreground">@${user.username}</div>
                    </div>
                  </div>
                `;
              }
              return `
                <div class="flex items-center gap-2">
                  <div class="size-8 rounded-full bg-muted flex items-center justify-center">
                    <span class="text-sm font-medium">${displayName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div class="font-medium">${displayName}</div>
                    <div class="text-sm text-muted-foreground">@${user.username}</div>
                  </div>
                </div>
              `;
            }
          };
        }
      );
      return renderSnippet(usernameSnippet, { user });
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const emailSnippet = createRawSnippet<[{ email: string }]>(
        (getEmail) => {
          const { email } = getEmail();
          return {
            render: () => `<div class="lowercase">${email}</div>`
          };
        }
      );
      return renderSnippet(emailSnippet, {
        email: row.original.email
      });
    },
  },
  {
    accessorKey: "total_packs_opened",
    header: () => {
      const headerSnippet = createRawSnippet(() => {
        return {
          render: () => `<div class="text-end">Packs Opened</div>`
        };
      });
      return renderSnippet(headerSnippet);
    },
    cell: ({ row }) => {
      const packsSnippet = createRawSnippet<[{ count: number }]>(
        (getCount) => {
          const { count } = getCount();
          return {
            render: () => `<div class="text-end font-medium">${count.toLocaleString()}</div>`
          };
        }
      );
      return renderSnippet(packsSnippet, {
        count: row.original.total_packs_opened
      });
    },
  },
  {
    accessorKey: "inventory_value_cents",
    header: () => {
      const headerSnippet = createRawSnippet(() => {
        return {
          render: () => `<div class="text-end">Inventory Value</div>`
        };
      });
      return renderSnippet(headerSnippet);
    },
    cell: ({ row }) => {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      });
      const valueSnippet = createRawSnippet<[{ value: number }]>(
        (getValue) => {
          const { value } = getValue();
          const formatted = formatter.format(value / 100);
          return {
            render: () => `<div class="text-end font-medium">${formatted}</div>`
          };
        }
      );
      return renderSnippet(valueSnippet, {
        value: row.original.inventory_value_cents
      });
    },
  },
  {
    accessorKey: "current_balance",
    header: () => {
      const headerSnippet = createRawSnippet(() => {
        return {
          render: () => `<div class="text-end">Balance</div>`
        };
      });
      return renderSnippet(headerSnippet);
    },
    cell: ({ row }) => {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      });
      const balanceSnippet = createRawSnippet<[{ balance: number }]>(
        (getBalance) => {
          const { balance } = getBalance();
          const formatted = formatter.format(balance);
          return {
            render: () => `<div class="text-end font-medium">${formatted}</div>`
          };
        }
      );
      return renderSnippet(balanceSnippet, {
        balance: row.original.current_balance
      });
    },
  },
  {
    accessorKey: "best_pull_value_cents",
    header: () => {
      const headerSnippet = createRawSnippet(() => {
        return {
          render: () => `<div class="text-end">Best Pull</div>`
        };
      });
      return renderSnippet(headerSnippet);
    },
    cell: ({ row }) => {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      });
      const bestPullSnippet = createRawSnippet<[{ value: number }]>(
        (getValue) => {
          const { value } = getValue();
          const formatted = formatter.format(value / 100);
          return {
            render: () => `<div class="text-end font-medium">${formatted}</div>`
          };
        }
      );
      return renderSnippet(bestPullSnippet, {
        value: row.original.best_pull_value_cents
      });
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const dateSnippet = createRawSnippet<[{ date: string }]>(
        (getDate) => {
          const { date } = getDate();
          const formatted = new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
          return {
            render: () => `<div class="text-sm">${formatted}</div>`
          };
        }
      );
      return renderSnippet(dateSnippet, {
        date: row.original.created_at
      });
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) =>
      renderComponent(DataTableActions, { userId: row.original.id, user: row.original })
  },
];
