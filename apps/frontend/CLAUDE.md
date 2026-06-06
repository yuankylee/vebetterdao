# CLAUDE.md — Frontend (apps/frontend)

Project-specific guidance for the Next.js frontend app.

# Create / Edit App Form

Both pages share the same layout pattern and components. Edit before adding or changing common fields.

## Layout (both pages)

`Grid templateColumns="repeat(3,1fr)"` — left `GridItem colSpan={[3,3,2]}` (white `Card.Root`, all fields + footer buttons) + right `GridItem colSpan={[3,3,1]}` (sticky panel).

## Shared components

| Component | Covers |
|-----------|--------|
| `src/components/SharedAppFormFields.tsx` | Name, Description, Project URL, Distribution Strategy |
| `src/components/SharedWalletAddressFields.tsx` | Treasury address, Admin address |
| `src/components/CategorySelector.tsx` | App Categories (generic RHF, used directly by both) |

Each caller passes its own `register(...)`/`error` (or `value`/`onAddressResolved`/`disabled`). Validation rules stay per-page.

## Field names (`CreateEditAppFormData`)

Client-side RHF only — both forms submit identical metadata keys:
- `external_url` (was `projectUrl`)
- `distribution_strategy` (was `distributionStrategy`)
- `adminAddress` (was `adminWalletAddress`)

## FormItem required asterisk

`FormItem` accepts `required` prop → renders red `*`. For non-FormItem labels use `<RequiredAsterisk />` from `src/components/CustomFormFields/FormItem.tsx`.

## Treasury/Admin editing (edit page only)

Inputs disabled for non-admins (`disabled={!isAdmin}`) — contract enforces `onlyRoleAndAppAdmin`. Changes are bundled into the same transaction as metadata via `useUpdateAppDetails` multi-clause support.

## Edit page sub-components

Logo (`EditAppLogo.tsx`) and Banner (`EditAppBanner.tsx`) live at `apps/[appId]/edit/components/EditAppPageContent/components/`. Both render inside a `SimpleGrid columns={[1,2]}` with fixed `h="200px"` and `rounded="9px"`. Logo is centered in its cell (`alignSelf="center"`).

## Key files

- `src/components/CreateEditAppForm/CreateEditAppForm.tsx` — create form
- `src/app/apps/new/form/components/NewAppPageFormContent.tsx` — create page wrapper
- `src/app/apps/[appId]/edit/components/EditAppPageContent/EditAppPageContent.tsx` — edit form
- `src/api/contracts/xApps/getXAppMetadata.ts` — `XAppMetadata` type (IPFS shape)
- `src/hooks/xApp/useUpdateAppDetails.ts` — multi-clause metadata+treasury+admin tx
- `src/components/CustomFormFields/FormItem.tsx` — `required` prop + `RequiredAsterisk` export

## Gotchas

- **ESLint `react/jsx-no-literals`**: Literal strings in JSX must be wrapped in `{}` expression containers (e.g., `{"More"}`, `{"App Score"}`). Bare literals like `More` or `App Score` cause lint failures.
- **`@iconscout/react-unicons` naming**: Some icons have `Alt` suffix — e.g., `UilDownload` doesn't exist, use `UilDownloadAlt`. Check exports before importing.
- **Grid `colSpan` with unequal columns**: When `templateColumns` defines unequal widths (e.g., `"2fr 1fr"`), use `colSpan={[1,1,1]}` for both items — `colSpan={[1,1,2]}` in a 2-column grid spans full width.
- **Card double padding**: `Card.Root` variant already includes padding. Don't add `p={}` to `Card.Body` unless intentional.
